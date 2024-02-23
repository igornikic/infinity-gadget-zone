import DefaultAvatar from "../../assets/default-avatar.webp";

export const productTestData = {
  name: "Test Product",
  price: 22.99,
  description:
    "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
  ratings: 4.5,
  images: [DefaultAvatar, DefaultAvatar],
  category: "Electronics",
  stock: 5,
  numOfReviews: 2,
  reviews: [
    {
      user: "64790344758eda847fa6895f",
      username: "TestUser",
      avatar: {
        public_id: "IGZavatars/rwhi3tufecxhc2rscimx",
        url: "https://res.cloudinary.com/dsqjoidmi/image/upload/v1689798283/IGZavatars/rwhi3tufecxhc2rscimx.png",
      },
      rating: 5,
      comment: "",
      date: "2024-01-01T21:18:24.819Z",
      _id: "65930c81733a037d35bac290",
    },
    {
      user: "652436262e5d260cd26feb89",
      username: "Testing",
      avatar: {
        public_id: "IGZavatars/rwhi3tufecxhc2rscimx",
        url: "https://res.cloudinary.com/dsqjoidmi/image/upload/v1689798283/IGZavatars/rwhi3tufecxhc2rscimx.png",
      },
      rating: 4,
      comment: "Nice",
      date: "2024-01-01T21:18:24.819Z",
      _id: "65930c81733a037d35bac291",
    },
  ],
  shopId: "64d194ec5fb1cfaede33629b",
  sold: 0,
  totalViews: 2,
  _id: "656e87ad3303f371f28eed77",
  views: [
    {
      viewerId: "64790344758eda847fa6895f",
      viewedAt: {
        $date: "2023-12-28T19:50:55.046Z",
      },
    },
    {
      viewerId: "652436262e5d260cd26feb89",
      viewedAt: {
        $date: "2023-12-29T19:50:55.046Z",
      },
    },
  ],
  createdAt: "2023-12-05T02:15:09.277Z",
  __v: 0,
};
