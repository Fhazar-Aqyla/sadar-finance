import avatar5 from "../../assets/images/users/avatar-5.jpg"
import avatar3 from "../../assets/images/users/avatar-3.jpg"
import avatar10 from "../../assets/images/users/avatar-10.jpg"
import avatar8 from "../../assets/images/users/avatar-8.jpg"
import avatar2 from "../../assets/images/users/avatar-2.jpg"
import avatar1 from "../../assets/images/users/avatar-1.jpg"
import avatar4 from "../../assets/images/users/avatar-4.jpg"
import avatar6 from "../../assets/images/users/avatar-6.jpg"
import avatar7 from "../../assets/images/users/avatar-7.jpg"
import avatar9 from "../../assets/images/users/avatar-9.jpg"
import imge7 from "../../assets/images/small/img-7.jpg"
import imge4 from "../../assets/images/small/img-4.jpg"

const headData = [
  {
    id: 1,
    name: "Nancy",
    picture: avatar5,
  },
  {
    id: 2,
    name: "Frank",
    picture: avatar3,
  },
  {
    id: 3,
    name: "Tonya",
    picture: avatar10,
  },
  {
    id: 4,
    name: "Thomas",
    picture: avatar8,
  },
  {
    id: 5,
    name: "Herbert",
    picture: avatar2,
  },
];
const tasklist = [
  {
    id: "1",
    name: "Unassigned",
    badge: 2,
    color: "success",
    cards: [
      {
        id: "2",
        title: "Profile Page Structure",
        text: "Profile Page means a web page accessible to the public or to guests.",
        userImages: [{ id: 1, img: avatar10 }, { id: 2, img: avatar3 }, { id: 3, img: avatar2 }],
        prowidth: "15%",
        procolor: "danger",
        badge1: ["Admin"],
        botId: "27 Dec, 2021",
        eye: "04",
        que: "19",
        clip: "02"
      },
      {
        id: "3",
        title: "Velzon - Admin Layout Design",
        text: "The dashboard is the front page of the Administration UI.",
        userImages: [{ id: 4, img: avatar9 }, { id: 5, img: avatar8 }],
        badge1: ["Layout", "Admin", "Dashboard"],
        botId: "07 Jan, 2022",
        eye: "14",
        que: "32",
        clip: "05"
      },
    ],
  },
  {
    id: "4",
    name: "To Do",
    badge: 2,
    color: "secondary",
    cards: [
      {
        id: "5",
        title: "Admin Layout Design",
        text: "Landing page template with clean, minimal and modern design.",
        userImages: [{ id: 6, img: avatar10 }, { id: 7, img: avatar3 }, { id: 8, img: avatar2 }],
        badge1: ["Design", "Website"],
        botId: "07 Jan, 2022",
        eye: "13",
        que: "52",
        clip: "17"
      },
      {
        id: "6",
        title: "Marketing & Sales",
        text: "Sales and marketing are two business functions within an organization.",
        userImages: [{ id: 9, img: avatar9 }, { id: 10, img: avatar8 }],
        badge1: ["Marketing", "Business"],
        botId: "27 Dec, 2021",
        eye: "24",
        que: "10",
        clip: "10"
      },
    ],
  },
  {
    id: "7",
    name: "Inprogress",
    badge: 2,
    color: "warning",
    cards: [
      {
        id: "8",
        title: "Brand Logo Design",
        cardId: "#VL2457",
        text: "BrandCrowd's brand logo maker allows you to generate and customize stand-out brand logos in minutes.",
        userImages: [{ id: 11, img: avatar5 }, { id: 12, img: avatar7 }, { id: 13, img: avatar6 }],
        badge1: ["Logo", "Design", "UI/UX"],
        botId: "22 Dec, 2021",
        eye: "24",
        que: "10",
        clip: "10",
        botpro: "55%",
        botprocolor: "warning"
      },
      {
        id: "9",
        title: "Change Old App Icon",
        cardId: "#VL2743",
        text: "Change app icons on Android: How do you change the look of your apps.",
        userImages: [{ id: 14, img: avatar10 }, { id: 15, img: avatar9 }, { id: 16, img: avatar5 }],
        badge1: ["Design", "Website"],
        botId: "24 Oct, 2021",
        eye: "64",
        que: "35",
        clip: "23"
      },
    ],
  },
  {
    id: "10",
    name: "IN REVIEWS",
    badge: 3,
    color: "info",
    cards: [
      {
        id: "11",
        title: "Create Product Animations",
        cardId: "#VL2453",
        userImages: [{ id: 17, img: avatar1 }],
        badge1: ["Ecommerce"],
        botId: "16 Nov, 2021",
        eye: "08",
        que: "54",
        clip: "28",
        picture: imge7,
        botpro: "100%",
        botprocolor: "success"
      },
      {
        id: "12",
        title: "Product Features Analysis",
        cardId: "#VL2340",
        text: "An essential part of strategic planning is running a product feature analysis.",
        userImages: [{ id: 18, img: avatar5 }, { id: 19, img: avatar6 }],
        badge1: ["Product", "Analysis"],
        botId: "05 Jan, 2022",
        eye: "14",
        que: "31",
        clip: "07"
      },
      {
        id: "13",
        title: "Create a Graph of Sketch",
        cardId: "#VL2462",
        text: "To make a pie chart with equal slices create a perfect circle by selecting an Oval Tool.",
        userImages: [{ id: 20, img: avatar4 }, { id: 21, img: avatar8 }, { id: 22, img: avatar2 }, { id: 23, img: avatar1 }],
        badge1: ["Sketch", "Marketing", "Design"],
        botId: "05 Nov, 2021",
        eye: "12",
        que: "74",
        clip: "37"
      },
    ],
  },
  {
    id: "14",
    name: "Completed",
    badge: 1,
    color: "success",
    cards: [
      {
        id: "15",
        title: "Create a Blog Template UI",
        text: "Landing page template with clean, minimal and modern design.",
        userImages: [{ id: 24, img: avatar8 }, { id: 25, img: avatar7 }, { id: 26, img: avatar6 }],
        badge1: ["Design", "Website"],
        prowidth: "35%",
        procolor: "danger",
        botId: "27 Dec, 2021",
        eye: "24",
        que: "10",
        clip: "10"
      },
    ],
  },
  {
    id: "16",
    name: "New",
    badge: 1,
    color: "success",
    cards: [
      {
        id: "17",
        title: "Banner Design for FB & Twitter",
        cardId: "#VL5287",
        userImages: [{ img: avatar3 }, { img: avatar2 }],
        badge1: ["UI/UX", "Graphic"],
        botId: "07 Jan, 2022",
        eye: "11",
        que: "26",
        clip: "30",
        picture: imge4,
        botpro: "55%",
        botprocolor: "warning"
      },
    ],
  },
];
const AddTeamMember = [
  { id: 1, img: avatar1, name: 'Albert Rodarte' },
  { id: 2, img: avatar2, name: 'Hannah Glover' },
  { id: 3, img: avatar3, name: 'Adrian Rodarte' },
  { id: 4, img: avatar4, name: 'Frank Hamilton' },
  { id: 5, img: avatar5, name: 'Justin Howard' },
  { id: 6, img: avatar6, name: 'Michael Lawrence' },
  { id: 7, img: avatar7, name: 'Oliver Sharp' },
  { id: 8, img: avatar8, name: 'Richard Simpson' }
]
export { headData, tasklist, AddTeamMember }