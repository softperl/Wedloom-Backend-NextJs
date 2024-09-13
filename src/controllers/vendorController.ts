import { Request, Response } from "express";
import prisma from "@/src/lib/prisma";
import { BadRequestError, UnAuthenticatedError } from "../errors";
import { StatusCodes } from "http-status-codes";
import { Role } from "@prisma/client";

const vendorProfileInfo = async (req: Request, res: Response) => {
  const userId = res.locals.user.id;
  const loginEmail = res.locals.user.email;
  const {
    brandName,
    categoryName,
    contactPersonName,
    additionalMail,
    contactNumber,
    website,
    facebook,
    instagram,
    youtube,
    addInfo,
    city,
    address,
    additionalData,
    projects,
  } = req.body;

  try {
    const vendor = await prisma.user.findFirst({
      where: {
        id: userId,
        role: "Vendor",
      },
    });

    const profile = await prisma.vendorProfileInfo.upsert({
      where: {
        userId: userId,
      },
      update: {
        loginEmail,
        brandName,
        categoryName,
        contactPersonName,
        additionalMail,
        contactNumber,
        website,
        facebook,
        instagram,
        youtube,
        addInfo,
        city,
        address,
        additionalData,
      },
      create: {
        userId,
        loginEmail,
        brandName,
        categoryName,
        contactPersonName,
        additionalMail,
        contactNumber,
        website,
        facebook,
        instagram,
        youtube,
        addInfo,
        city,
        address,
        additionalData,
      },
    });

    res.status(StatusCodes.OK).json({ profile, vendor });
  } catch (error: any) {
    console.log(error);
    throw new BadRequestError(
      error.message || error.msg || "Something went wrong"
    );
  }
};

const getVendorsList = async (req: Request, res: Response) => {
  try {
    const vendors = await prisma.user.findMany({
      where: {
        role: "Vendor",
        isApproved: true,
      },
    });
    if (!vendors) {
      throw new BadRequestError("No vendors found");
    }

    const vendorsList = await prisma.user.findMany({
      where: {
        id: {
          in: vendors.map((vendor) => vendor.id),
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        city: true,
        vendorType: true,
        brand: true,
        ProjectPhoto: {
          where: {
            isFeatured: true,
          },
        },
        reviews: {},
      },
    });

    res.status(StatusCodes.OK).json({ vendorsList });
  } catch (error) {
    throw new BadRequestError("Something went wrong");
  }
};
const getVendorProfileInfo = async (req: Request, res: Response) => {
  const userId = res.locals.user.id;
  try {
    const vendorProfile = await prisma.user.findFirst({
      where: {
        id: userId,
        role: "Vendor",
      },
    });
    const vendorInfo = await prisma.vendorProfileInfo.findFirst({
      where: {
        userId,
      },
    });

    res.status(StatusCodes.OK).json({ vendorInfo, vendorProfile });
  } catch (error) {
    throw new BadRequestError("Something went wrong");
  }
};

const createVendor = async (req: Request, res: Response) => {
  const { userId } = req.body;

  try {
    if (!userId) {
      throw new BadRequestError("User not found");
    }

    const approveRequest = await prisma.user.findFirst({
      where: {
        id: userId,
        role: "Vendor",
        isApproved: false,
      },
    });

    if (!approveRequest) {
      throw new BadRequestError("Vendor already approved");
    }

    await prisma.user.update({
      where: { id: userId },
      data: { isApproved: true },
    });

    const newVendor = await prisma.vendor.create({
      data: {
        userId: userId,
      },
    });
    res.status(StatusCodes.OK).json({ newVendor });
  } catch (error) {
    console.log(error);
    throw new BadRequestError("Something went wrong");
  }
};

const createBanquet = async (req: Request, res: Response) => {
  const userId = res.locals.user.id;
  const { title, type, fixedCapacity, floatCapacity } = req.body;

  if (!title || !type || !fixedCapacity || !floatCapacity) {
    throw new BadRequestError("All fields are required");
  }

  try {
    if (!userId) {
      throw new BadRequestError("User not found");
    }
    const isVendor = await prisma.user.findFirst({
      where: {
        id: userId,
        role: "Vendor",
      },
    });
    if (!isVendor) {
      throw new UnAuthenticatedError("User is not a vendor");
    }
    const newBanquet = await prisma.banquet.create({
      data: {
        userId,
        title,
        type,
        fixedCapacity,
        floatCapacity,
      },
    });

    res.status(StatusCodes.OK).json({ newBanquet });
  } catch (error) {
    console.log(error);
    throw new BadRequestError("Something went wrong");
  }
};

const getBanquet = async (req: Request, res: Response) => {
  const userId = res.locals.user.id;
  try {
    const banquet = await prisma.banquet.findMany({
      where: {
        userId,
      },
    });
    res.status(StatusCodes.OK).json({ banquet });
  } catch (error) {
    throw new BadRequestError("Something went wrong");
  }
};

const removeBanquet = async (req: Request, res: Response) => {
  const userId = res.locals.user.id;
  const { banquetId } = req.params;
  try {
    if (!userId) {
      throw new BadRequestError("User not found");
    }
    const isVendor = await prisma.user.findFirst({
      where: {
        id: userId,
        role: "Vendor",
      },
    });
    if (!isVendor) {
      throw new UnAuthenticatedError("User is not a vendor");
    }
    await prisma.banquet.delete({
      where: {
        id: banquetId,
        userId,
      },
    });

    res.status(StatusCodes.OK).json({});
  } catch (error) {
    console.log(error);
    throw new BadRequestError("Something went wrong");
  }
};

const createProject = async (req: Request, res: Response) => {
  const userId = res.locals.user.id;
  const { photos } = req.body;

  const normalizedPhotos = Array.isArray(photos) ? photos : [photos];

  if (!normalizedPhotos || normalizedPhotos.length === 0) {
    throw new BadRequestError("Images are required");
  }

  try {
    if (!userId) {
      throw new BadRequestError("User not found");
    }
    const isVendor = await prisma.user.findFirst({
      where: {
        id: userId,
        role: "Vendor",
      },
    });
    if (!isVendor) {
      throw new UnAuthenticatedError("User is not a vendor");
    }

    const photoPromises = normalizedPhotos.map((photo) =>
      prisma.projectPhoto.create({
        data: {
          userId,
          photo,
        },
      })
    );

    await Promise.all(photoPromises);

    res.status(StatusCodes.OK).json({});
  } catch (error) {
    console.log(error);
    throw new BadRequestError("Something went wrong");
  }
};

const getProjects = async (req: Request, res: Response) => {
  const userId = res.locals.user.id;
  try {
    const projects = await prisma.projectPhoto.findMany({
      where: {
        userId,
      },
    });

    const featured = await prisma.projectPhoto.findFirst({
      where: {
        userId,
        isFeatured: true,
      },
    });
    res.status(StatusCodes.OK).json({ projects, featured });
  } catch (error) {
    throw new BadRequestError("Something went wrong");
  }
};

const uploadRulesPortfolio = async (req: Request, res: Response) => {
  const userId = res.locals.user.id;
  let MAX_FILES = 40;
  const MAX_FILE_SIZE = 1024 * 1024 * 3;
  const ACCEPTED_FILE_FORMATS = ".png, .jpeg, .jpg";

  const photosCount = await prisma.projectPhoto.count({
    where: {
      userId,
    },
  });
  MAX_FILES -= photosCount;
  const MAX_MB = MAX_FILE_SIZE / 1024 / 1024;

  res.status(StatusCodes.OK).json({ MAX_MB, MAX_FILES, ACCEPTED_FILE_FORMATS });
};

const makeFeatured = async (req: Request, res: Response) => {
  const userId = res.locals.user.id;
  const { projectId } = req.params;
  if (!projectId) {
    throw new BadRequestError("Project ID is required");
  }
  try {
    if (!userId) {
      throw new BadRequestError("User not found");
    }
    const isVendor = await prisma.user.findFirst({
      where: {
        id: userId,
        role: "Vendor",
      },
    });
    if (!isVendor) {
      throw new UnAuthenticatedError("User is not a vendor");
    }
    const images = await prisma.projectPhoto.findMany({
      where: { id: projectId },
    });

    if (images.length === 0) {
      throw new Error("No images found.");
    }

    // Find the current featured image for the vendor
    const currentFeaturedImage = await prisma.projectPhoto.findFirst({
      where: {
        userId,
        isFeatured: true,
      },
    });

    // If there is a current featured image, set its featured property to false
    if (currentFeaturedImage) {
      await prisma.projectPhoto.update({
        where: {
          userId,
          id: currentFeaturedImage.id,
        },
        data: { isFeatured: false },
      });
    }

    // Set the new image's featured property to true
    await prisma.projectPhoto.update({
      where: {
        userId,
        id: projectId,
      },
      data: { isFeatured: true },
    });

    res.status(StatusCodes.OK).json({});
  } catch (error) {
    console.log(error);
    throw new BadRequestError("Something went wrong");
  }
};

const removeProjectById = async (req: Request, res: Response) => {
  const userId = res.locals.user.id;
  const { projectId } = req.params;
  try {
    if (!userId) {
      throw new BadRequestError("User not found");
    }
    const isVendor = await prisma.user.findFirst({
      where: {
        id: userId,
        role: "Vendor",
      },
    });
    if (!isVendor) {
      throw new UnAuthenticatedError("User is not a vendor");
    }
    await prisma.projectPhoto.delete({
      where: {
        id: projectId,
        userId,
      },
    });

    res.status(StatusCodes.OK).json({});
  } catch (error) {
    console.log(error);
    throw new BadRequestError("Something went wrong");
  }
};

const createAlbum = async (req: Request, res: Response) => {
  const userId = res.locals.user.id;
  const { name, photoIds } = req.body;
  try {
    if (!userId) {
      throw new BadRequestError("User not found");
    }
    const isVendor = await prisma.user.findFirst({
      where: {
        id: userId,
        role: "Vendor",
      },
    });
    if (!isVendor) {
      throw new UnAuthenticatedError("User is not a vendor");
    }
    await prisma.projectAlbum.create({
      data: {
        userId,
        name,
        photos: photoIds,
      },
    });

    res.status(StatusCodes.OK).json({});
  } catch (error) {
    console.log(error);
    throw new BadRequestError("Something went wrong");
  }
};

const removeAlbumById = async (req: Request, res: Response) => {
  const userId = res.locals.user.id;
  const { albumId } = req.params;
  try {
    if (!userId) {
      throw new BadRequestError("User not found");
    }
    const isVendor = await prisma.user.findFirst({
      where: {
        id: userId,
        role: "Vendor",
      },
    });
    if (!isVendor) {
      throw new UnAuthenticatedError("User is not a vendor");
    }
    await prisma.projectAlbum.delete({
      where: {
        userId,
        id: albumId,
      },
    });

    res.status(StatusCodes.OK).json({});
  } catch (error) {
    console.log(error);
    throw new BadRequestError("Something went wrong");
  }
};

const getAlbums = async (req: Request, res: Response) => {
  const userId = res.locals.user.id;
  try {
    const albums = await prisma.projectAlbum.findMany({
      where: {
        userId,
      },
    });
    res.status(StatusCodes.OK).json({ albums });
  } catch (error) {
    throw new BadRequestError("Something went wrong");
  }
};

const createVideo = async (req: Request, res: Response) => {
  const userId = res.locals.user.id;
  const { video } = req.body;
  try {
    if (!userId) {
      throw new BadRequestError("User not found");
    }
    const isVendor = await prisma.user.findFirst({
      where: {
        id: userId,
        role: "Vendor",
      },
    });
    if (!isVendor) {
      throw new UnAuthenticatedError("User is not a vendor");
    }

    const existingVideo = await prisma.projectVideo.findFirst({
      where: {
        userId,
        video,
      },
    });

    if (existingVideo) {
      throw new BadRequestError("Video already exists");
    }

    // Create a new video entry
    await prisma.projectVideo.create({
      data: {
        userId,
        video,
      },
    });

    res.status(StatusCodes.OK).json({});
  } catch (error) {
    console.log(error);
    throw new BadRequestError("Something went wrong");
  }
};
const getVideos = async (req: Request, res: Response) => {
  const userId = res.locals.user.id;
  try {
    const videos = await prisma.projectVideo.findMany({
      where: {
        userId,
      },
    });
    res.status(StatusCodes.OK).json({ videos });
  } catch (error) {
    throw new BadRequestError("Something went wrong");
  }
};
const removeVideoById = async (req: Request, res: Response) => {
  const userId = res.locals.user.id;
  const { videoId } = req.params;
  try {
    if (!userId) {
      throw new BadRequestError("User not found");
    }
    const isVendor = await prisma.user.findFirst({
      where: {
        id: userId,
        role: "Vendor",
      },
    });
    if (!isVendor) {
      throw new UnAuthenticatedError("User is not a vendor");
    }
    await prisma.projectVideo.delete({
      where: {
        id: videoId,
        userId,
      },
    });

    res.status(StatusCodes.OK).json({});
  } catch (error) {
    console.log(error);
    throw new BadRequestError("Something went wrong");
  }
};

const createFoodMenu = async (req: Request, res: Response) => {
  const userId = res.locals.user.id;
  const { title, menuType, price, starter, mainCourse, soupOrSalad, dessert } =
    req.body;

  if (
    !title ||
    !menuType ||
    !price ||
    !starter ||
    !mainCourse ||
    !soupOrSalad ||
    !dessert
  ) {
    throw new BadRequestError("All fields are required");
  }

  try {
    if (!userId) {
      throw new BadRequestError("User not found");
    }
    const isVendor = await prisma.user.findFirst({
      where: {
        id: userId,
        role: "Vendor",
      },
    });
    if (!isVendor) {
      throw new UnAuthenticatedError("User is not a vendor");
    }
    await prisma.foodMenu.create({
      data: {
        userId,
        title,
        menuType,
        price,
        starter,
        mainCourse,
        soupOrSalad,
        dessert,
      },
    });

    res.status(StatusCodes.OK).json({});
  } catch (error) {
    console.log(error);
    throw new BadRequestError("Something went wrong");
  }
};

const getFoodMenu = async (req: Request, res: Response) => {
  const userId = res.locals.user.id;
  try {
    const foodMenu = await prisma.foodMenu.findMany({
      where: {
        userId,
      },
    });
    res.status(StatusCodes.OK).json({ foodMenu });
  } catch (error) {
    throw new BadRequestError("Something went wrong");
  }
};

const removeFoodMenu = async (req: Request, res: Response) => {
  const userId = res.locals.user.id;
  const { menuId } = req.params;
  try {
    if (!userId) {
      throw new BadRequestError("User not found");
    }
    const isVendor = await prisma.user.findFirst({
      where: {
        id: userId,
        role: "Vendor",
      },
    });
    if (!isVendor) {
      throw new UnAuthenticatedError("User is not a vendor");
    }
    await prisma.foodMenu.delete({
      where: {
        id: menuId,
        userId,
      },
    });

    res.status(StatusCodes.OK).json({});
  } catch (error) {
    console.log(error);
    throw new BadRequestError("Something went wrong");
  }
};

const uploadRulesFoodMenu = async (req: Request, res: Response) => {
  const userId = res.locals.user.id;
  let MAX_FILES = 40;
  const MAX_FILE_SIZE = 1024 * 1024 * 3;
  const ACCEPTED_FILE_FORMATS = ".png, .jpeg, .jpg";

  const photosCount = await prisma.foodMenu.count({
    where: {
      userId,
    },
  });
  MAX_FILES -= photosCount;
  const MAX_MB = MAX_FILE_SIZE / 1024 / 1024;

  res.status(StatusCodes.OK).json({ MAX_MB, MAX_FILES, ACCEPTED_FILE_FORMATS });
};

const createFoodMenuPhotos = async (req: Request, res: Response) => {
  const userId = res.locals.user.id;
  const { photos } = req.body;

  const normalizedPhotos = Array.isArray(photos) ? photos : [photos];

  if (!normalizedPhotos || normalizedPhotos.length === 0) {
    throw new BadRequestError("Images are required");
  }

  try {
    if (!userId) {
      throw new BadRequestError("User not found");
    }
    const isVendor = await prisma.user.findFirst({
      where: {
        id: userId,
        role: "Vendor",
      },
    });
    if (!isVendor) {
      throw new UnAuthenticatedError("User is not a vendor");
    }

    const photoPromises = normalizedPhotos.map((photo) =>
      prisma.foodMenuImage.create({
        data: {
          userId,
          image: photo,
        },
      })
    );

    await Promise.all(photoPromises);

    res.status(StatusCodes.OK).json({});
  } catch (error) {
    console.log(error);
    throw new BadRequestError("Something went wrong");
  }
};

export {
  vendorProfileInfo,
  getVendorProfileInfo,
  createVendor,
  getVendorsList,
  createBanquet,
  getBanquet,
  removeBanquet,
  createProject,
  uploadRulesPortfolio,
  getProjects,
  createAlbum,
  createVideo,
  getVideos,
  removeProjectById,
  getAlbums,
  removeAlbumById,
  removeVideoById,
  makeFeatured,
  createFoodMenu,
  getFoodMenu,
  removeFoodMenu,
  uploadRulesFoodMenu,
  createFoodMenuPhotos,
};
