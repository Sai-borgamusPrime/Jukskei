const teams = [
  {
    id: 1,
    slug: "tech-wizards",
    name: "Tech Wizards",
    color: "Green",
    logo: "/tech-wizards-logo.png",
    bannerLogo: "/tech-wizards-logo.png",
    schedule: [
      {
        id: 1,
        datetime: "13/05/2026 08:00 - 08:30",
        match: "Tech Wizards VS Nathan's Hammers",
        dotColor: "green",
      },
      {
        id: 2,
        datetime: "13/05/2026 08:30 - 09:00",
        match: "King Price Assassins VS Tech Wizards",
        dotColor: "yellow",
      },
    ],
  },
  {
    id: 2,
    slug: "nathans-hammers",
    name: "Nathans Hammers",
    color: "Yellow",
    logo: "/hammers-logo.png",
    bannerLogo: "/hammers-logo.png",
    schedule: [
      {
        id: 1,
        datetime: "13/05/2026 08:00 - 08:30",
        match: "Nathans Hammers VS Tech Wizards",
        dotColor: "yellow",
      },
      {
        id: 2,
        datetime: "13/05/2026 08:30 - 09:00",
        match: "Nathans Hammers VS King Price Assassins",
        dotColor: "yellow",
      },
      {
        id: 3,
        datetime: "13/05/2026 09:00 - 09:30",
        match: "Nathans Hammers VS Ombu Juggernauts",
        dotColor: "yellow",
      },
    ],
  },
  {
    id: 3,
    slug: "ombu-juggernauts",
    name: "Ombu Juggernauts",
    color: "Orange",
    logo: "/ombu-logo.png",
    bannerLogo: "/ombu-logo.png",
    schedule: [
      {
        id: 1,
        datetime: "13/05/2026 09:00 - 09:30",
        match: "Nathans Hammers VS Ombu Juggernauts",
        dotColor: "orange",
      },
    ],
  },
  {
    id: 4,
    slug: "king-price-assassins",
    name: "King Price Assassins",
    color: "Red",
    logo: "/kingprice-logo.png",
    bannerLogo: "/kingprice-logo.png",
    schedule: [
      {
        id: 1,
        datetime: "13/05/2026 08:30 - 09:00",
        match: "Nathans Hammers VS King Price Assassins",
        dotColor: "red",
      },
    ],
  },
  {
    id: 5,
    slug: "draft-warriors",
    name: "Draft Warriors",
    color: "Black",
    logo: "/windhoek-logo.png",
    bannerLogo: "/windhoek-logo.png",
    schedule: [
      {
        id: 1,
        datetime: "14/05/2026 10:00 - 10:30",
        match: "Draft Warriors VS Tech Wizards",
        dotColor: "black",
      },
    ],
  },
];

export default teams;