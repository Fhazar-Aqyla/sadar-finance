import avatar2 from "../../assets/images/users/avatar-2.jpg"
import avatar3 from "../../assets/images/users/avatar-3.jpg"
import avatar5 from "../../assets/images/users/avatar-5.jpg"
import avatar6 from "../../assets/images/users/avatar-6.jpg"
import avatar7 from "../../assets/images/users/avatar-7.jpg"
import avatar9 from "../../assets/images/users/avatar-9.jpg"
import avatar10 from "../../assets/images/users/avatar-10.jpg"

import blog2 from "../../assets/images/blog/img-2.jpg"
import blog3 from "../../assets/images/blog/img-3.jpg"
import blog4 from "../../assets/images/blog/img-4.jpg"
import blog5 from "../../assets/images/blog/img-5.jpg"
import blog6 from "../../assets/images/blog/img-6.jpg"

const blogwidget = [
    {
        "count": "17.6k",
        "label": "Followers",
        "icon": "users",
        "bgColor": "success"
    },
    {
        "count": "149",
        "label": "Total Post",
        "icon": "file-text",
        "bgColor": "warning"
    },
    {
        "count": "24.8k",
        "label": "Likes",
        "icon": "heart",
        "bgColor": "danger"
    },
    {
        "count": "54.3k",
        "label": "Views",
        "icon": "bar-chart",
        "bgColor": "primary"
    }
]

const socialShares = [
    { "platform": "Facebook", "count": "32k", "icon": "facebook-box-fill", "textColor": "primary", "margin": "mb-2" },
    { "platform": "Google", "count": "13k", "icon": "google-line", "textColor": "danger", "margin": "mb-2" },
    { "platform": "WhatsApp", "count": "11k", "icon": "whatsapp-line", "textColor": "success", "margin": "mb-2" },
    { "platform": "Invision", "count": "19k", "icon": "invision-line", "textColor": "dark", "margin": "mb-2" },
    { "platform": "Instagram", "count": "18k", "icon": "instagram-line", "textColor": "danger", "margin": "mb-2" },
    { "platform": "Telegram", "count": "26k", "icon": "telegram-line", "textColor": "info", "margin": "mb-2" },
    { "platform": "YouTube", "count": "9k", "icon": "youtube-line", "textColor": "secondary" }
]

const comments = [
    {
        "name": "Diana Kohler",
        "avatar": avatar3,
        "comment": "Really well-written and informative. The emotional connection strategy is something I’ll be testing out more!"
    },
    {
        "name": "Tonya Noble",
        "avatar": avatar5,
        "comment": "Incredibly helpful tips, especially about adding a call to action. I’ve been missing that step and will implement it in my next post!"
    },
    {
        "name": "Donald Palmer",
        "avatar": avatar6,
        "comment": "Fantastic read! The power of visuals and trends really stood out to me. Thanks for sharing these useful insights!"
    },
    {
        "name": "Joseph Parker",
        "avatar": avatar7,
        "comment": "Great post! Simple yet powerful tips that I can start using immediately. Thanks for sharing your expertise!"
    },
    {
        "name": "Timothy Smith",
        "avatar": avatar9,
        "comment": "Wow, this has opened my eyes to a new perspective on creating content. Emotional triggers—such a smart way to engage users!"
    },
    {
        "name": "Alexis Clarke",
        "avatar": avatar10,
        "comment": "Fantastic read! The power of visuals and trends really stood out to me. Thanks for sharing these useful insights!"
    },
    {
        "name": "Thomas Taylor",
        "avatar": avatar2,
        "comment": "Loved the section on visual storytelling. It’s true that images speak louder on social media platforms. More visuals in my next posts for sure!"
    }
]

const recentTable = [
    {
        "id": "01",
        "image": blog2,
        "title": "The Evolution of Minimalism in Design",
        "date": "20 Sep, 2024",
        "category": "MinimalDesign",
        "comments": 23,
        "shares": 157,
        "likes": 11,
        "views": 2149
    },
    {
        "id": "02",
        "image": blog3,
        "title": "Mastering User Experience Through Storytelling",
        "date": "11 Feb, 2024",
        "category": "UXDesign",
        "comments": 547,
        "shares": 1458,
        "likes": 317,
        "views": 34978
    },
    {
        "id": "03",
        "image": blog4,
        "title": "Designing for Purpose: A Mindful Approach",
        "date": "15 Sep, 2024",
        "category": "CreativeProcess",
        "comments": 88,
        "shares": 649,
        "likes": 237,
        "views": 1982
    },
    {
        "id": "04",
        "image": blog5,
        "title": "How to Overcome Creative Block",
        "date": "09 July, 2024",
        "category": "CreativeBlock",
        "comments": 67,
        "shares": 1114,
        "likes": 1547,
        "views": 15747
    },
    {
        "id": "05",
        "image": blog6,
        "title": "Building Brand Identity through Design",
        "date": "19 Nov, 2024",
        "category": "BrandDesign",
        "comments": 8,
        "shares": 10,
        "likes": 7,
        "views": 110
    }
]

export { blogwidget, socialShares, comments, recentTable }