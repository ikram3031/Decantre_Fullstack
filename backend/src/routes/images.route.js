// import { Router } from "express";

// const imagesRouter = Router();

// imagesRouter.get("/resize", async (req, res, next) => {
//   try {
//     const url = req.query.url;
//     const width = Math.max(1, parseInt(req.query.w || "200", 10));
//     const height = Math.max(1, parseInt(req.query.h || "200", 10));
//     const quality = Math.max(1, Math.min(100, parseInt(req.query.q || "80", 10)));

//     if (!url) {
//       res.status(400).json({ status: "error", message: "query param `url` is required" });
//       return;
//     }

//     const fetched = await fetch(url);
//     if (!fetched.ok) {
//       res.status(400).json({ status: "error", message: "failed to fetch image" });
//       return;
//     }

//     const arrayBuffer = await fetched.arrayBuffer();
//     const input = Buffer.from(arrayBuffer);

//     const img = await Jimp.read(input);
//     img.cover(width, height);
//     img.quality(quality);
//     const output = await img.getBufferAsync(Jimp.MIME_JPEG);

//     res.setHeader("Content-Type", "image/jpeg");
//     res.setHeader("Cache-Control", "public, max-age=86400");
//     res.send(output);
//   } catch (err) {
//     next(err);
//   }
// });

// export default imagesRouter;
