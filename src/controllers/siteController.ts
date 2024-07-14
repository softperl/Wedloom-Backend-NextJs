import { Request, Response } from "express";
import prisma from "@/src/lib/prisma";
import { BadRequestError, UnAuthenticatedError } from "../errors";
import { StatusCodes } from "http-status-codes";
import { aboutSchema, newLegalSchema } from "../schema/site.schema";

const newTerms = async (req: Request, res: Response) => {
  try {
    const data = newLegalSchema.parse(req.body);
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
  }
};

const newPrivacy = async (req: Request, res: Response) => {
  try {
    const data = newLegalSchema.parse(req.body);
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
    const data = newLegalSchema.parse(req.body);
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
    const { title, href, subMenus } = req.body;
    const menu = await prisma.menu.upsert({
      where: {
        title,
      },
      create: {
        title,
        href,
        subMenus,
      },
      update: {
        ...(title && { title }),
        ...(href && { href }),
        ...(subMenus && { subMenus }),
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
    const { name, id } = req.body;
    await prisma.vendorCategory.upsert({
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

const getVendorCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.vendorCategory.findMany();
    res.status(StatusCodes.OK).json({ categories });
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
    const menus = await prisma.menu.findMany();
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
        menus,
      },
    });
  } catch (error) {
    console.log(error);
    throw new BadRequestError("Something went wrong");
  }
};

export {
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
};
