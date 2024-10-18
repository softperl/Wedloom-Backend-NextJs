import { get } from "lodash";
import express from "express";
import {
  finalApproval,
  createAlbum,
  createBanquet,
  createFaq,
  createFoodMenu,
  createFoodMenuPhotos,
  createPackage,
  createProject,
  createVendor,
  createVideo,
  galleryPhotos,
  getAlbums,
  getBanquet,
  getFaq,
  getFoodMenu,
  getPackage,
  getProjects,
  getPublicPackage,
  getPublicVendorProfileById,
  getVendorProfileInfo,
  getVendorsList,
  getVideos,
  makeFeatured,
  removeAlbumById,
  removeBanquet,
  removeFaq,
  removeFoodMenu,
  removePackage,
  removeProjectById,
  removeVideoById,
  requestApprovalVendor,
  uploadRulesFoodMenu,
  uploadRulesPortfolio,
  vendorProfileInfo,
  getApproval,
  approvalByUserId,
  adminViewProfile,
} from "../controllers/vendorController";
import hasRole from "../middleware/hasRole";
import requireUser from "../middleware/requireUser";

const router = express.Router();

router.route("/profile-info").post(requireUser, vendorProfileInfo);
router.route("/get-profile-info").get(requireUser, getVendorProfileInfo);
router.route("/new-vendor").post(requireUser, hasRole(["Admin"]), createVendor);
router.route("/list/get-all/:vendorCity/:vendorType").get(getVendorsList);
router
  .route("/banquet/new")
  .post(requireUser, hasRole(["Vendor"]), createBanquet);
router.route("/get-all-banquet").get(requireUser, getBanquet);
router.route("/banquet/delete/:banquetId").delete(requireUser, removeBanquet);
router.route("/project-image/new").post(requireUser, createProject);
router.route("/project-image/get-all").get(requireUser, getProjects);
router
  .route("/project-image/featured/:projectId")
  .post(requireUser, makeFeatured);
router
  .route("/project-image/delete/:projectId")
  .delete(requireUser, removeProjectById);
router.route("/project-album/new").post(requireUser, createAlbum);
router.route("/project-album/get-all").get(requireUser, getAlbums);
router
  .route("/project-album/delete/:albumId")
  .delete(requireUser, removeAlbumById);
router.route("/project-video/new").post(requireUser, createVideo);
router.route("/project-video/get-all").get(requireUser, getVideos);
router
  .route("/project-video/delete/:videoId")
  .delete(requireUser, removeVideoById);
router.route("/food-menu/new").post(requireUser, createFoodMenu);
router.route("/food-menu/get-all").get(requireUser, getFoodMenu);
router.route("/food-menu/delete/:menuId").delete(requireUser, removeFoodMenu);
router
  .route("/upload-image-rules/portfolio")
  .get(requireUser, uploadRulesPortfolio);
router
  .route("/upload-image-rules/foodMenu")
  .get(requireUser, uploadRulesFoodMenu);
router.route("/food-menu-image/new").post(requireUser, createFoodMenuPhotos);
router.route("/get-vendor-profile/:profileId").get(getPublicVendorProfileById);
router.route(`/gallery/:profileId`).get(galleryPhotos);
router.route("/package/new").post(requireUser, createPackage);
router.route("/package/get-all").get(requireUser, getPackage);
router.route("/package/:profileId").get(getPublicPackage);
router.route("/package/delete/:id").delete(requireUser, removePackage);
router.route("/faq/new").post(requireUser, createFaq);
router.route("/faq/get-all/:profileId").get(getFaq);
router.route("/faq/delete/:id").delete(requireUser, removeFaq);
router.route("/request-approval").post(requestApprovalVendor);
router.route("/final-approval").post(requireUser, finalApproval);
router.route("/approval-userId").post(requireUser, approvalByUserId);
router.route("/approval-get-all").get(requireUser, getApproval);
router
  .route("/admin/get-profile-info/:vendorId")
  .get(hasRole(["Admin", "Super"]), adminViewProfile);

export { router as vendorRoutes };
