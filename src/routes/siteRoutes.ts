import express from "express";
import {
  newTerms,
  newPrivacy,
  newRefund,
  deleteTerms,
  deletePrivacy,
  deleteRefund,
  getTerms,
  getPrivacy,
  getRefund,
  getAbout,
  newAbout,
  newMenu,
  getMenus,
  deleteMenu,
  newSocialLinks,
  getSocialLinks,
  getSiteData,
  newContactInfo,
  newMap,
  newCity,
  getCities,
  deleteCity,
  newVendorCategory,
  getVendorCategories,
  deleteVendorCategory,
  newCheclist,
  getChecklist,
  deleteChecklist,
  getPlans,
  deletePlan,
  newPlan,
  getVendorCategoryById,
  getSteps,
  newStep,
  getVendorsFeatured,
  newFooterMenu,
  getFooterMenu,
} from "../controllers/siteController";
import requireUser from "../middleware/requireUser";
import hasRole from "../middleware/hasRole";

const router = express.Router();

router
  .route("/terms/new")
  .post(requireUser, hasRole(["Admin", "Super"]), newTerms);
router
  .route("/privacy/new")
  .post(requireUser, hasRole(["Admin", "Super"]), newPrivacy);
router
  .route("/refund/new")
  .post(requireUser, hasRole(["Admin", "Super"]), newRefund);
router
  .route("/terms/delete")
  .delete(requireUser, hasRole(["Admin", "Super"]), deleteTerms);
router
  .route("/privacy/delete")
  .delete(requireUser, hasRole(["Admin", "Super"]), deletePrivacy);
router
  .route("/refund/delete")
  .delete(requireUser, hasRole(["Admin", "Super"]), deleteRefund);
router.route("/terms").get(getTerms);
router.route("/privacy").get(getPrivacy);
router.route("/refund").get(getRefund);
router.route("/about").get(getAbout);
router
  .route("/about/new")
  .post(requireUser, hasRole(["Admin", "Super"]), newAbout);

router
  .route("/menu/new")
  .post(requireUser, hasRole(["Admin", "Super"]), newMenu);
router.route("/menus").get(getMenus);
router
  .route("/menu/delete/:menuId")
  .delete(requireUser, hasRole(["Admin", "Super"]), deleteMenu);

router
  .route("/menu-footer/new")
  .post(requireUser, hasRole(["Admin", "Super"]), newFooterMenu);
router.route("/menus-footer").get(getFooterMenu);

router
  .route("/social-links/new")
  .post(requireUser, hasRole(["Admin", "Super"]), newSocialLinks);
router.route("/social-links").get(getSocialLinks);
router.route("/data").get(getSiteData);

//New
router
  .route("/contact-info/new")
  .post(requireUser, hasRole(["Admin", "Super"]), newContactInfo);
router.route("/map/new").post(requireUser, hasRole(["Admin", "Super"]), newMap);
router
  .route("/city/new")
  .post(requireUser, hasRole(["Admin", "Super"]), newCity);
router.route("/cities").get(getCities);
router
  .route("/city/delete/:cityId")
  .delete(requireUser, hasRole(["Admin", "Super"]), deleteCity);
router
  .route("/vendor-category/new")
  .post(requireUser, hasRole(["Admin", "Super"]), newVendorCategory);
router.route("/vendor-categories").get(getVendorCategories);
router
  .route("/vendor-category/delete/:categoryId")
  .delete(requireUser, hasRole(["Admin", "Super"]), deleteVendorCategory);
router
  .route("/checklist/new")
  .post(requireUser, hasRole(["Admin", "Super"]), newCheclist);
router.route("/checklist").get(getChecklist);
router
  .route("/checklist/delete/:listId")
  .delete(requireUser, hasRole(["Admin", "Super"]), deleteChecklist);

router
  .route("/plans/new")
  .post(requireUser, hasRole(["Admin", "Super"]), newPlan);
router.route("/plans").get(getPlans);
router
  .route("/plans/delete/:planId")
  .delete(requireUser, hasRole(["Admin", "Super"]), deletePlan);
router
  .route("/get-category/vendor-id")
  .get(
    requireUser,
    hasRole(["Admin", "Super", "Vendor"]),
    getVendorCategoryById
  );
router
  .route("/step/new")
  .post(requireUser, hasRole(["Admin", "Super"]), newStep);
router.route("/get-all-steps").get(getSteps);

router.route("/vendors/get-all-featured").get(getVendorsFeatured);

export { router as siteRoutes };
