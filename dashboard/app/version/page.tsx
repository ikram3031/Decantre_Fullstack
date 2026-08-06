"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/core/api-client";
import clientConfig from "../../client-config.json";

export default function VersionPage() {
  const [backendVersion, setBackendVersion] = useState<string>("Loading...");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchVersion() {
      try {
        const res = await apiClient.get<{ version: string }>("/api/v1/version");
        setBackendVersion(res.data?.version || "1.0.0");
      } catch (err: any) {
        setError(err.message || "Failed to fetch backend version (Make sure you are logged in as Admin)");
        setBackendVersion("Error");
      }
    }
    fetchVersion();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-900 font-sans p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-100">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">System Versions</h1>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b pb-3 border-gray-100">
            <span className="font-medium text-gray-600">Dashboard Core</span>
            <span className="font-semibold text-blue-600">{clientConfig.version.core}</span>
          </div>
          
          <div className="flex justify-between items-center border-b pb-3 border-gray-100">
            <span className="font-medium text-gray-600">Dashboard Client</span>
            <span className="font-semibold text-blue-600">decantre-dashboard-{clientConfig.version.client}</span>
          </div>

          <div className="flex justify-between items-center pt-1">
            <span className="font-medium text-gray-600">Backend API</span>
            <span className={`font-semibold ${error ? 'text-red-500' : 'text-green-600'}`}>
              {backendVersion}
            </span>
          </div>
        </div>

        {error && (
          <div className="mt-6 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 text-center">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
