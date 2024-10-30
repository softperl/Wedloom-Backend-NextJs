import { Request, Response } from "express";
import prisma from "@/src/lib/prisma";
import { BadRequestError, UnAuthenticatedError } from "../errors";
import { StatusCodes } from "http-status-codes";
import { aboutSchema, newLegalSchema } from "../schema/site.schema";
import { averageReview } from "../utils/general.utils";

const newTerms = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const terms = await prisma.term.upsert({
      where: {
        id: data.id || 0,
      },
      create: {
        title: data.title,
        content: data.content,
        siteId: 0,
        status: data.status,
      },
      update: {
        ...(data.title && { title: data.title }),
        ...(data.content && { content: data.content }),
        ...(data.status && { status: data.status }),
      },
    });
    res.status(StatusCodes.OK).json({ terms });
  } catch (error) {
    console.log(error);
    throw new BadRequestError("Something went wrong");
    ``;
  }
};

const newPrivacy = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const terms = await prisma.privacy.upsert({
      where: {
        id: data.id || 0,
      },
      create: {
        title: data.title,
        content: data.content,
        siteId: 0,
        status: data.status,
      },
      update: {
        ...(data.title && { title: data.title }),
        ...(data.content && { content: data.content }),
        ...(data.status && { status: data.status }),
      },
    });
    res.status(StatusCodes.OK).json({ terms });
  } catch (error) {
    console.log(error);
    throw new BadRequestError("Something went wrong");
  }
};

const newRefund = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const terms = await prisma.refund.upsert({
      where: {
        id: data.id || 0,
      },
      create: {
        title: data.title,
        content: data.content,
        siteId: 0,
        status: data.status,
      },
      update: {
        ...(data.title && { title: data.title }),
        ...(data.content && { content: data.content }),
        ...(data.status && { status: data.status }),
      },
    });
    res.status(StatusCodes.OK).json({ terms });
  } catch (error) {
    console.log(error);
    throw new BadRequestError("Something went wrong");
  }
};

const deleteTerms = async (req: Request, res: Response) => {
  try {
    await prisma.term.deleteMany();
    res.status(StatusCodes.OK).json({ message: "Deleted" });
  } catch (error) {
    console.log(error);
    throw new BadRequestError("Something went wrong");
  }
};
const deletePrivacy = async (req: Request, res: Response) => {
  try {
    await prisma.privacy.deleteMany();
    res.status(StatusCodes.OK).json({ message: "Deleted" });
  } catch (error) {
    console.log(error);
    throw new BadRequestError("Something went wrong");
  }
};

const deleteRefund = async (req: Request, res: Response) => {
  try {
    await prisma.refund.deleteMany();
    res.status(StatusCodes.OK).json({ message: "Deleted" });
  } catch (error) {
    console.log(error);
    throw new BadRequestError("Something went wrong");
  }
};

const getTerms = async (req: Request, res: Response) => {
  try {
    const terms = await prisma.term.findFirst({
      where: {
        siteId: 0,
      },
    });
    res.status(StatusCodes.OK).json({ terms });
  } catch (error) {
    console.log(error);
    throw new BadRequestError("Something went wrong");
  }
};

const getPrivacy = async (req: Request, res: Response) => {
  try {
    const privacy = await prisma.privacy.findFirst({
      where: {
        siteId: 0,
      },
    });
    res.status(StatusCodes.OK).json({ privacy });
  } catch (error) {
    console.log(error);
    throw new BadRequestError("Something went wrong");
  }
};

const getRefund = async (req: Request, res: Response) => {
  try {
    const refund = await prisma.refund.findFirst({
      where: {
        siteId: 0,
      },
    });
    res.status(StatusCodes.OK).json({ refund });
  } catch (error) {
    console.log(error);
    throw new BadRequestError("Something went wrong");
  }
};

const newAbout = async (req: Request, res: Response) => {
  try {
    const data = aboutSchema.parse(req.body);
    const about = await prisma.about.upsert({
      where: {
        id: data.id || 0,
      },
      create: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        tagLine: data.tagLine,
        content: data.content,
        seoTitle: data.seoTitle,
        description: data.description,
        seoKeyWords: data.seoKeyWords,
        siteId: 0,
      },
      update: {
        ...(data.name && { name: data.name }),
        ...(data.email && { email: data.email }),
        ...(data.phone && { phone: data.phone }),
        ...(data.tagLine && { tagLine: data.tagLine }),
        ...(data.content && { content: data.content }),
        ...(data.seoTitle && { seoTitle: data.seoTitle }),
        ...(data.description && { description: data.description }),
        ...(data.seoKeyWords && { seoKeyWords: data.seoKeyWords }),
      },
    });
    res.status(StatusCodes.OK).json({ about });
  } catch (error) {
    console.log(error);
    throw new BadRequestError("Something went wrong");
  }
};

const getAbout = async (req: Request, res: Response) => {
  try {
    const about = await prisma.about.findFirst({
      where: {
        siteId: 0,
      },
    });
    res.status(StatusCodes.OK).json({ about });
  } catch (error) {
    console.log(error);
    throw new BadRequestError("Something went wrong");
  }
};

const newMenu = async (req: Request, res: Response) => {
  try {
    const { id, menus } = req.body;
    await prisma.menu.upsert({
      where: {
        id,
      },
      create: {
        menus,
      },
      update: {
        ...(menus && { menus }),
      },
    });
  } catch (error) {
    console.log(error);
    throw new BadRequestError("Something went wrong");
  }
};
const newFooterMenu = async (req: Request, res: Response) => {
  try {
    const { id, menus } = req.body;
    await prisma.footerMenu.upsert({
      where: {
        id,
      },
      create: {
        menus,
      },
      update: {
        ...(menus && { menus }),
      },
    });
  } catch (error) {
    console.log(error);
    throw new BadRequestError("Something went wrong");
  }
};

const getMenus = async (req: Request, res: Response) => {
  try {
    const menus = await prisma.menu.findMany();
    res.status(StatusCodes.OK).json({ menus });
  } catch (error) {
    console.log(error);
    throw new BadRequestError("Something went wrong");
  }
};
const getFooterMenu = async (req: Request, res: Response) => {
  try {
    const menus = await prisma.footerMenu.findMany();
    res.status(StatusCodes.OK).json({ menus });
  } catch (error) {
    console.log(error);
    throw new BadRequestError("Something went wrong");
  }
};

const deleteMenu = async (req: Request, res: Response) => {
  const { menuId } = req.params;
  try {
    await prisma.menu.delete({
      where: {
        id: menuId,
      },
    });
    res.status(StatusCodes.OK).json({ message: "Deleted" });
  } catch (error) {
    console.log(error);
    throw new BadRequestError("Something went wrong");
  }
};

const newSocialLinks = async (req: Request, res: Response) => {
  try {
    const {
      id,
      Facebook,
      Twitter,
      Pinterest,
      Instagram,
      Youtube,
      Linkedin,
      TikTok,
      Reddit,
      Discord,
      WhatsApp,
      Telegram,
      Quora,
      Tumblr,
      Threads,
    } = req.body;
    await prisma.socialLink.upsert({
      where: {
        id: id || 0,
      },
      create: {
        Facebook,
        Twitter,
        Pinterest,
        Instagram,
        Youtube,
        Linkedin,
        TikTok,
        Reddit,
        Discord,
        WhatsApp,
        Telegram,
        Quora,
        Tumblr,
        Threads,
      },
      update: {
        Facebook,
        Twitter,
        Pinterest,
        Instagram,
        Youtube,
        Linkedin,
        TikTok,
        Reddit,
        Discord,
        WhatsApp,
        Telegram,
        Quora,
        Tumblr,
        Threads,
      },
    });
    res.status(StatusCodes.OK).json({ message: "Updated" });
  } catch (error) {
    console.log(error);
    throw new BadRequestError("Something went wrong");
  }
};

const getSocialLinks = async (req: Request, res: Response) => {
  try {
    const socialLinks = await prisma.socialLink.findFirst();
    res.status(StatusCodes.OK).json({ socialLinks });
  } catch (error) {
    console.log(error);
    throw new BadRequestError("Something went wrong");
  }
};

const newContactInfo = async (req: Request, res: Response) => {
  try {
    const { id, email, location, phone } = req.body;
    const info = await prisma.contactInfo.upsert({
      where: {
        id: id || 0,
      },
      create: {
        email,
        location,
        phone,
      },
      update: {
        email,
        location,
        phone,
      },
    });
    res.status(StatusCodes.OK).json({ info });
  } catch (error) {
    console.log(error);
    throw new BadRequestError("Something went wrong");
  }
};

const newMap = async (req: Request, res: Response) => {
  try {
    const { url, id } = req.body;
    const map = await prisma.map.upsert({
      where: {
        id: id || 0,
      },
      create: {
        url,
      },
      update: {
        url,
      },
    });
    res.status(StatusCodes.OK).json({ map });
  } catch (error) {
    console.log(error);
    throw new BadRequestError("Something went wrong");
  }
};

const newCity = async (req: Request, res: Response) => {
  try {
    const { name, id } = req.body;
    await prisma.city.upsert({
      where: {
        id: id || 0,
      },
      create: {
        name,
      },
      update: {
        name,
      },
    });
    res.status(StatusCodes.OK).json({ message: "Updated" });
  } catch (error) {
    console.log(error);
    throw new BadRequestError("Something went wrong");
  }
};

const getCities = async (req: Request, res: Response) => {
  try {
    const cities = await prisma.city.findMany();
    res.status(StatusCodes.OK).json({ cities });
  } catch (error) {
    console.log(error);
    throw new BadRequestError("Something went wrong");
  }
};

const deleteCity = async (req: Request, res: Response) => {
  const { cityId } = req.params;
  try {
    await prisma.city.delete({
      where: {
        id: +cityId,
      },
    });
    res.status(StatusCodes.OK).json({ message: "Deleted" });
  } catch (error) {
    console.log(error);
    throw new BadRequestError("Something went wrong");
  }
};

const newVendorCategory = async (req: Request, res: Response) => {
  try {
    const { name, id, photo } = req.body;
    await prisma.vendorCategory.upsert({
      where: {
        id: id || 0,
      },
      create: {
        name,
        photo,
      },
      update: {
        name,
        photo,
      },
    });
    res.status(StatusCodes.OK).json({ message: "Updated" });
  } catch (error) {
    console.log(error);
    throw new BadRequestError("Something went wrong");
  }
};

const getVendorCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.vendorCategory.findMany();
    res.status(StatusCodes.OK).json({ categories });
  } catch (error) {
    console.log(error);
    throw new BadRequestError("Something went wrong");
  }
};

const getVendorCategoryById = async (req: Request, res: Response) => {
  try {
    const userId = res.locals.user.id;
    const category = await prisma.user.findFirst({
      where: {
        id: userId,
        role: "Vendor",
      },
    });
    res.status(StatusCodes.OK).json(category);
  } catch (error) {
    console.log(error);
    throw new BadRequestError("Something went wrong");
  }
};

const deleteVendorCategory = async (req: Request, res: Response) => {
  const { categoryId } = req.params;
  try {
    await prisma.vendorCategory.delete({
      where: {
        id: +categoryId,
      },
    });
    res.status(StatusCodes.OK).json({ message: "Deleted" });
  } catch (error) {
    console.log(error);
    throw new BadRequestError("Something went wrong");
  }
};

const newCheclist = async (req: Request, res: Response) => {
  try {
    const { name, id } = req.body;
    await prisma.checklist.upsert({
      where: {
        id: id || 0,
      },
      create: {
        name,
      },
      update: {
        name,
      },
    });
    res.status(StatusCodes.OK).json({ message: "Success" });
  } catch (error) {
    console.log(error);
    throw new BadRequestError("Something went wrong");
  }
};

const getChecklist = async (req: Request, res: Response) => {
  try {
    const lists = await prisma.checklist.findMany();
    res.status(StatusCodes.OK).json({ lists });
  } catch (error) {
    console.log(error);
    throw new BadRequestError("Something went wrong");
  }
};

const deleteChecklist = async (req: Request, res: Response) => {
  const { listId } = req.params;
  try {
    await prisma.checklist.delete({
      where: {
        id: +listId,
      },
    });
    res.status(StatusCodes.OK).json({ message: "Deleted" });
  } catch (error) {
    console.log(error);
    throw new BadRequestError("Something went wrong");
  }
};

const getSiteData = async (req: Request, res: Response) => {
  try {
    const menus = await prisma.menu.findMany({
      select: {
        menus: true,
      },
    });
    const footerMenu = await prisma.footerMenu.findMany({
      select: {
        menus: true,
      },
    });
    const steps = await prisma.step.findMany();
    const siteData = await prisma.site.findFirst({
      include: {
        about: true,
        socialLink: true,
        contactInfo: true,
        map: true,
        cities: true,
        vendorCategories: true,
        checklists: true,
      },
    });
    res.status(StatusCodes.OK).json({
      siteData: {
        ...siteData,
        footerMenu,
        menus,
        steps,
      },
    });
  } catch (error) {
    console.log(error);
    throw new BadRequestError("Something went wrong");
  }
};

const newPlan = async (req: Request, res: Response) => {
  const { type, price, tax, name, features, id } = req.body;
  if (!type || !price || !tax || !name || !features) {
    throw new BadRequestError("Please provide all fields");
  }
  try {
    const plan = await prisma.subsPlan.upsert({
      where: { id: id || 0 },
      create: {
        type,
        price,
        tax,
        name,
        features,
      },
      update: {
        type,
        price,
        tax,
        name,
        features,
      },
    });
    res.status(StatusCodes.CREATED).json({ plan });
  } catch (error) {
    console.log(error);
    throw new BadRequestError("Something went wrong");
  }
};

const changePlanStatus = async (req: Request, res: Response) => {
  const { id, status } = req.body;
  if (!id || !status) {
    throw new BadRequestError("Please provide both id and status");
  }
  try {
    const plan = await prisma.subsPlan.update({
      where: { id },
      data: { status },
    });
    res.status(StatusCodes.OK).json({ plan });
  } catch (error) {
    console.log(error);
    throw new BadRequestError("Something went wrong");
  }
};

const deletePlan = async (req: Request, res: Response) => {
  const { planId } = req.params;
  try {
    await prisma.subsPlan.delete({
      where: {
        id: planId,
      },
    });
    res.status(StatusCodes.OK).json({ message: "Deleted" });
  } catch (error) {
    console.log(error);
    throw new BadRequestError("Something went wrong");
  }
};

const getPlans = async (req: Request, res: Response) => {
  try {
    const plans = await prisma.subsPlan.findMany();
    res.status(StatusCodes.OK).json({ plans });
  } catch (error) {
    console.log(error);
    throw new BadRequestError("Something went wrong");
  }
};

const newStep = async (req: Request, res: Response) => {
  try {
    const { content, id } = req.body;
    await prisma.step.upsert({
      where: {
        id: id || 0,
      },
      create: {
        content,
      },
      update: {
        content,
      },
    });
    res.status(StatusCodes.OK).json({ message: "Success" });
  } catch (error) {
    console.log(error);
    throw new BadRequestError("Something went wrong");
  }
};

const getSteps = async (req: Request, res: Response) => {
  try {
    const steps = await prisma.step.findMany();
    res.status(StatusCodes.OK).json({ steps });
  } catch (error) {
    console.log(error);
    throw new BadRequestError("Something went wrong");
  }
};

const getVendorsFeatured = async (req: Request, res: Response) => {
  try {
    const vendorsData = await prisma.user.findMany({
      where: {
        role: "Vendor",
        isFeatured: true,
      },
      select: {
        id: true,
        vendorType: true,
        city: true,
        brand: true,
        vendorReviews: {
          select: {
            rating: true,
          },
        },
        ProjectPhoto: {
          where: {
            isFeatured: true,
          },
          select: {
            photo: true,
          },
        },
      },
    });

    // Initial Package Price
    const initialPrices = await prisma.package.findMany({
      where: {
        userId: {
          in: vendorsData.map((vendor) => vendor.id),
        },
      },
      orderBy: {
        createdAt: "asc",
      },
      select: {
        userId: true,
        packagePrice: true,
      },
    });

    // Create a map of user IDs to their initial package prices
    const initialPriceMap = new Map(
      initialPrices.map((price) => [price.userId, price.packagePrice])
    );

    // Calculate average rating for each vendor and add initial price
    const featured = vendorsData.map((vendor) => {
      const averageRating = averageReview(vendor.vendorReviews);
      return {
        ...vendor,
        averageRating,
        initialPrice: initialPriceMap.get(vendor.id) || null,
      };
    });

    res.status(StatusCodes.OK).json({ featured });
  } catch (error) {
    console.log(error);
    throw new BadRequestError("Something went wrong");
  }
};

export {
  newStep,
  getSteps,
  getPlans,
  deletePlan,
  newPlan,
  newTerms,
  newPrivacy,
  newRefund,
  deleteTerms,
  deletePrivacy,
  deleteRefund,
  getTerms,
  getPrivacy,
  getRefund,
  newAbout,
  getAbout,
  newMenu,
  newFooterMenu,
  getFooterMenu,
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
  getVendorCategoryById,
  getVendorsFeatured,
};
