import { mapRemoteProduct } from "../store/productHelpers";

// Centralized helper to get the sanitized API base URL from env
export const getApiBaseUrl = () => {
	const envUrl =
		import.meta.env.VITE_API_URL || import.meta.env.NEXT_PUBLIC_API_URL || "";
	return envUrl ? envUrl.replace(/\/$/, "") : "";
};

// Centralized helper to get the image base URL from env
export const getImageBaseUrl = () => {
	const envImgUrl =
		import.meta.env.VITE_IMAGE_BASE_URL ||
		import.meta.env.NEXT_PUBLIC_IMAGE_BASE_URL ||
		"";
	return envImgUrl ? envImgUrl.replace(/\/$/, "") : getApiBaseUrl();
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchWithTimeout = async (url, options = {}, timeout = 10000) => {
	const controller = new AbortController();
	const id = setTimeout(() => controller.abort(), timeout);
	try {
		const response = await fetch(url, {
			...options,
			signal: controller.signal,
		});
		clearTimeout(id);
		return response;
	} catch (err) {
		clearTimeout(id);
		throw err;
	}
};

const fetchWithRetry = async (
	url,
	options = {},
	timeout = 10000,
	maxAttempts = 3,
	attempt = 1,
) => {
	try {
		return await fetchWithTimeout(url, options, timeout);
	} catch (err) {
		if (attempt >= maxAttempts) {
			throw err;
		}
		await delay(250 * attempt);
		return fetchWithRetry(url, options, timeout, maxAttempts, attempt + 1);
	}
};

/**
 * Fetch Products
 */
export async function fetchProducts(opts = {}) {
	const apiBaseUrl = getApiBaseUrl();

	const skip = opts.skip ?? opts.offset ?? 0;
	const limit = Math.min(opts.limit || 20, 100);
	const sortBy = opts.sortBy || "createdAt";
	const order = opts.order || "desc";
	const q = opts.q || opts.search || opts.keyword || "";

	const hasFilters =
		opts.category ||
		opts.brand ||
		opts.season ||
		opts.tags ||
		opts.filter ||
		opts.name ||
		opts.slug ||
		opts.did;

	let res;
	try {
		if (hasFilters) {
			const body = {};
			if (q) body.q = q;
			if (opts.category) body.category = opts.category;
			if (opts.brand) body.brand = opts.brand;
			if (opts.season) body.season = opts.season;
			if (opts.tags) body.tags = opts.tags;
			if (opts.filter) body.filter = opts.filter;
			if (opts.name) body.name = opts.name;
			if (opts.slug) body.slug = opts.slug;
			if (opts.did) body.did = opts.did;
			body.skip = skip;
			body.limit = limit;
			body.sortBy = sortBy;
			body.order = order;

			res = await fetchWithRetry(
				`${apiBaseUrl}/api/v1/products`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(body),
				},
				10000,
				3,
			);
		} else {
			const params = new URLSearchParams();
			if (q) params.set("q", q);
			params.set("skip", String(skip));
			params.set("limit", String(limit));
			params.set("sortBy", sortBy);
			params.set("order", order);

			res = await fetchWithRetry(
				`${apiBaseUrl}/api/v1/products?${params.toString()}`,
				{},
				10000,
				3,
			);
		}

		if (!res.ok) {
			throw new Error(`Server error: ${res.status}`);
		}

		const json = await res.json();
		const list = Array.isArray(json.data)
			? json.data
			: Array.isArray(json)
				? json
				: [];
		const mapped = list.map(mapRemoteProduct);
		mapped._meta = json.meta || null;
		mapped._totalRows = json.totalRows || list.length;
		return mapped;
	} catch (err) {
		console.error("fetchProducts Error:", err);
		throw err;
	}
}

/**
 * Fetch Product Details
 */
export async function fetchProductDetails(slugOrId) {
	const apiBaseUrl = getApiBaseUrl();
	try {
		let res = await fetchWithRetry(
			`${apiBaseUrl}/api/v1/products/${slugOrId}`,
			{},
			8000,
			3,
		);
		if (!res.ok) {
			res = await fetchWithRetry(
				`${apiBaseUrl}/api/wp/products/${slugOrId}`,
				{},
				8000,
				3,
			);
		}

		if (!res.ok) {
			throw new Error("Failed to fetch product details.");
		}

		const json = await res.json();
		const targetData = json.data || json;
		if (targetData && typeof targetData === "object") {
			return mapRemoteProduct(targetData);
		}
		return null;
	} catch (err) {
		console.error("fetchProductDetails Error:", err);
		throw err;
	}
}

/**
 * Fetch Categories
 */
export async function fetchCategories(opts = {}) {
	const apiBaseUrl = getApiBaseUrl();
	const skip = opts.skip ?? 0;
	const limit = opts.limit || 50;

	try {
		const res = await fetchWithRetry(
			`${apiBaseUrl}/api/v1/categories?skip=${skip}&limit=${limit}`,
			{},
			8000,
			3,
		);
		if (!res.ok) throw new Error("Failed to fetch categories.");
		const json = await res.json();
		return Array.isArray(json.data)
			? json.data
			: Array.isArray(json)
				? json
				: [];
	} catch (err) {
		console.error("fetchCategories Error:", err);
		throw err;
	}
}

/**
 * Fetch Brands
 */
export async function fetchBrands(opts = {}) {
	const apiBaseUrl = getApiBaseUrl();
	const skip = opts.skip ?? 0;
	const limit = opts.limit || 50;

	try {
		const res = await fetchWithRetry(
			`${apiBaseUrl}/api/v1/brands?skip=${skip}&limit=${limit}`,
			{},
			8000,
			3,
		);
		if (!res.ok) throw new Error("Failed to fetch brands.");
		const json = await res.json();
		return Array.isArray(json.data)
			? json.data
			: Array.isArray(json)
				? json
				: [];
	} catch (err) {
		console.error("fetchBrands Error:", err);
		throw err;
	}
}

/**
 * Fetch Combo / Bundle Products
 */
export async function fetchCombos(opts = {}) {
	const limit = opts.limit || 100;
	const categoryNames = ["Combo", "Bundle", "Combo Set"];

	for (const cat of categoryNames) {
		try {
			const results = await fetchProducts({ category: cat, skip: 0, limit });
			if (results && results.length > 0) return results;
		} catch (_) {
			// try next category fallback
		}
	}
	return [];
}

/**
 * Create Order
 */
export async function createOrder(orderPayload) {
	const apiBaseUrl = getApiBaseUrl();
	const res = await fetch(`${apiBaseUrl}/api/v1/orders/new-order`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(orderPayload),
	});
	const json = await res.json().catch(() => null);
	if (!res.ok) {
		const errorMsg =
			json?.errors?.join(", ") || json?.message || "Failed to place order";
		throw new Error(errorMsg);
	}
	return json;
}

/**
 * User Login (Fixed Endpoint Path)
 */
export async function loginUser(credentials) {
	const apiBaseUrl = getApiBaseUrl();
	const res = await fetch(`${apiBaseUrl}/api/v1/auth/login`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(credentials),
	});
	const json = await res.json().catch(() => null);
	if (!res.ok) {
		const errorMsg =
			json?.errors?.join(", ") ||
			json?.message ||
			json?.error ||
			"Login failed. Please check your credentials.";
		throw new Error(errorMsg);
	}
	return json;
}

/**
 * User Registration
 */
export async function registerUser(userData) {
	const apiBaseUrl = getApiBaseUrl();
	const res = await fetch(`${apiBaseUrl}/api/v1/auth/register`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(userData),
	});
	const json = await res.json().catch(() => null);
	if (!res.ok) {
		const errorMsg =
			json?.errors?.join(", ") ||
			json?.message ||
			json?.error ||
			"Registration failed. Please try again.";
		throw new Error(errorMsg);
	}
	return json;
}

/**
 * OTP Verification
 */
export async function verifyOTP(payload) {
	const apiBaseUrl = getApiBaseUrl();
	const res = await fetch(`${apiBaseUrl}/api/v1/auth/verify-otp`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload),
	});
	const json = await res.json().catch(() => null);
	if (!res.ok) {
		const errorMsg =
			json?.errors?.join(", ") ||
			json?.message ||
			json?.error ||
			"Invalid OTP code. Please try again.";
		throw new Error(errorMsg);
	}
	return json;
}

/**
 * Resend OTP
 */
export async function resendOTP(payload) {
	const apiBaseUrl = getApiBaseUrl();
	const res = await fetch(`${apiBaseUrl}/api/v1/auth/resend-otp`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload),
	});
	const json = await res.json().catch(() => null);
	if (!res.ok) {
		const errorMsg =
			json?.errors?.join(", ") ||
			json?.message ||
			json?.error ||
			"Failed to resend OTP.";
		throw new Error(errorMsg);
	}
	return json;
}

/**
 * MEMBERS API COLLECTION (/api/v1/members)
 */

export async function fetchMembers() {
	const apiBaseUrl = getApiBaseUrl();
	const res = await fetch(`${apiBaseUrl}/api/v1/members`, {
		method: "GET",
		headers: { "Content-Type": "application/json" },
	});
	const json = await res.json().catch(() => null);
	if (!res.ok) {
		throw new Error(
			json?.message || json?.error || "Failed to fetch members list.",
		);
	}
	return json?.data || (Array.isArray(json) ? json : []);
}

export async function fetchMemberById(memberId) {
	const apiBaseUrl = getApiBaseUrl();
	const res = await fetch(`${apiBaseUrl}/api/v1/members/${memberId}`, {
		method: "GET",
		headers: { "Content-Type": "application/json" },
	});
	const json = await res.json().catch(() => null);
	if (!res.ok) {
		throw new Error(json?.message || json?.error || "Member not found.");
	}
	return json?.data || json;
}

export async function createMember(memberPayload) {
	const apiBaseUrl = getApiBaseUrl();
	const res = await fetch(`${apiBaseUrl}/api/v1/members`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(memberPayload),
	});
	const json = await res.json().catch(() => null);
	if (!res.ok) {
		const errorMsg =
			json?.errors?.join(", ") ||
			json?.message ||
			json?.error ||
			"Failed to create member.";
		throw new Error(errorMsg);
	}
	return json?.data || json;
}

export async function updateMember(memberId, updatePayload) {
	const apiBaseUrl = getApiBaseUrl();
	const res = await fetch(`${apiBaseUrl}/api/v1/members/${memberId}`, {
		method: "PUT",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(updatePayload),
	});
	const json = await res.json().catch(() => null);
	if (!res.ok) {
		const errorMsg =
			json?.errors?.join(", ") ||
			json?.message ||
			json?.error ||
			"Failed to update member.";
		throw new Error(errorMsg);
	}
	return json?.data || json;
}

export async function deleteMember(memberId) {
	const apiBaseUrl = getApiBaseUrl();
	const res = await fetch(`${apiBaseUrl}/api/v1/members/${memberId}`, {
		method: "DELETE",
		headers: { "Content-Type": "application/json" },
	});
	const json = await res.json().catch(() => null);
	if (!res.ok) {
		throw new Error(json?.message || json?.error || "Failed to delete member.");
	}
	return json;
}
