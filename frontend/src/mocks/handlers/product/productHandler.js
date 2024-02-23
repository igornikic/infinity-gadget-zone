import { rest } from "msw";
import { productTestData as ptd } from "../../../test-data/product/productTestData";

export const newProductHandler = rest.post(
  "/api/product/new",
  (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        product: ptd,
      }),
      ctx.status(201)
    );
  }
);

export const getProductsHandler = rest.get("/api/products", (req, res, ctx) => {
  return res(
    ctx.json({
      success: true,
      products: [ptd],
      loading: false,
      resPerPage: 20,
      filteredProductsCount: 1,
      error: null,
    }),
    ctx.status(200)
  );
});

export const getShopProductsHandler = rest.get(
  "/api/products/shop/:id",
  (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        products: [ptd, { ...ptd, totalViews: 1 }],
        loading: false,
        resPerPage: 20,
        filteredProductsCount: 1,
        error: null,
      }),
      ctx.status(200)
    );
  }
);

export const productDetailsHandler = rest.get(
  "/api/product/:id",
  (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        product: ptd,
      }),
      ctx.status(200)
    );
  }
);

export const newReviewHandler = rest.put("/api/review", (req, res, ctx) => {
  return res(
    ctx.json({
      success: true,
    }),
    ctx.status(201)
  );
});

export const productReviewsHandler = rest.get(
  "/api/reviews",
  (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        ratings: 5,
        numOfReviews: 1,
        reviews: [
          {
            avatar: {
              public_id: "IGZavatars/ifzs1syknyoggvkv7l5f",
              url: "https://res.cloudinary.com/dsqjoidmi/image/upload/v1703792420/IGZavatars/ifzs1syknyoggvkv7l5f.png",
            },
            user: "64b7eca4ba043a499902bd8e",
            username: "TestAdmin",
            rating: 5,
            comment: "Test",
            date: "2024-01-02T17:20:13.255Z",
            _id: "659445cdf372272048ec99f9",
          },
        ],
      }),
      ctx.status(200)
    );
  }
);

export const deleteReviewHandler = rest.delete(
  "/api/reviews",
  (req, res, ctx) => {
    return res(
      ctx.json({
        isDeleted: true,
      }),
      ctx.status(200)
    );
  }
);
