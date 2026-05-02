import BreadCrumb from '../../../../Components/Common/BreadCrumb';
import React from 'react'
import { Container } from 'reactstrap';
import { Link } from 'react-router-dom';

import overview from "../../../../assets/images/blog/overview.jpg"
import avatar2 from "../../../../assets/images/users/avatar-2.jpg"
import avatar6 from "../../../../assets/images/users/avatar-6.jpg"
import avatar8 from "../../../../assets/images/users/avatar-8.jpg"
import avatar10 from "../../../../assets/images/users/avatar-10.jpg"
import small4 from "../../../../assets/images/small/img-4.jpg"
import small5 from "../../../../assets/images/small/img-5.jpg"
import SimpleBar from 'simplebar-react';

const PageBlogOverview = () => {

    document.title = "Overview | Velzon - React Admin & Dashboard Template";

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <BreadCrumb title="Overview" pageTitle="Blogs" />

                    <div className="row justify-content-center">
                        <div className="col-xxl-10">
                            <div className="card">
                                <div className="card-body">
                                    <div className="text-center mb-4">
                                        <p className="text-success text-uppercase mb-2">Art & Design</p>
                                        <h4 className="mb-2">The Art of Storytelling in Design</h4>
                                        <p className="text-muted mb-4">How to create impactful narratives through visual elements.</p>
                                        <div className="d-flex align-items-center justify-content-center flex-wrap gap-2">
                                            <span className="badge bg-primary-subtle text-primary">CraftedPerspectives</span>
                                            <span className="badge bg-primary-subtle text-primary">DesignInspiration</span>
                                            <span className="badge bg-primary-subtle text-primary">ArtAndDesign</span>
                                        </div>
                                    </div>
                                    <img src={overview} alt="" className="img-thumbnail" />

                                    <div className="row mt-4">
                                        <div className="col-lg-3">
                                            <h6 className="pb-1">Contributor By:</h6>
                                            <div className="d-flex gap-2 mb-3">
                                                <div className="flex-shrink-0">
                                                     <img src={avatar2} alt="" className="avatar-sm rounded" />
                                                </div>
                                                <div className="flex-grow-1">
                                                    <h5 className="mb-1"><Link to="#!">Nancy Martino</Link></h5>
                                                    <p className="mb-2">Creative Designer</p>
                                                    <p className="text-muted mb-0">2 hours ago</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-lg-9">
                                            <p className="text-muted mb-3">Storytelling has always been a powerful way to communicate, and in the world of design, it’s no different. Visual storytelling allows designers to go beyond aesthetics and create meaningful connections with their audience. It transforms static designs into engaging narratives that leave a lasting impression. In this post, we’ll explore the art of storytelling in design, how it enhances user experiences, and how you can incorporate it into your creative work.</p>
                                            <h6>Introduction:</h6>
                                            <p className="text-muted mb-3">Design is more than just making things look good—it’s about conveying a message and creating an experience. And the best designs tell a story. From logos and branding to websites and product design, storytelling is woven into every aspect of successful design projects. When you integrate storytelling into your design, you give your audience something to connect with emotionally, making your work more memorable and impactful.</p>
                                            <h5 className="fw-semibold">1. Why Storytelling Matters in Design:</h5>
                                            <p className="text-muted mb-2">At its core, storytelling in design helps to create a deeper emotional connection between the user and the product or brand. It provides context, helps communicate values, and drives engagement by making the user feel like they’re part of the narrative. Here are a few reasons why storytelling is a vital part of design:</p>
                                            <ul>
                                                <li className="pb-1"><strong>Emotional Connection:</strong> <span className="text-muted">Stories evoke emotions, and emotions drive decisions. Whether you're designing a brand or a user interface, the emotions tied to your design influence how users engage with it.</span></li>
                                                <li className="pb-1"><strong>Memorability:</strong> <span className="text-muted">People are more likely to remember a story than a simple image or message. By embedding a narrative into your design, you help your audience recall your brand, product, or message more effectively.</span></li>
                                                <li><strong>Clarity of Message:</strong> <span className="text-muted">Good storytelling clarifies your message. It can take a complex idea and distill it into something easily digestible through visuals, layout, and interactions.</span></li>
                                            </ul>
                                            <blockquote className="blockquote custom-blockquote blockquote-secondary rounded mb-3">
                                                <p className="text-body mb-2">"Storytelling in design turns a simple visual into an experience. It transforms static elements into living narratives that engage, inspire, and resonate with those who interact with them."</p>
                                                <footer className="blockquote-footer mt-0"><cite title="Source Title">Liam Huxley</cite></footer>
                                            </blockquote>
                                            <h5 className="fw-semibold">2. Elements of Storytelling in Design:</h5>
                                            <p className="text-muted mb-2">To tell a story through design, you need to incorporate several key elements:</p>
                                            <ul>
                                                <li className="pb-1"><strong>Characters:</strong> <span className="text-muted">Every story has characters, and in design, your characters might be users, brand mascots, or even products themselves. Think about how your design can personify or represent these characters to engage your audience.</span></li>
                                                <li className="pb-1"><strong>Plot:</strong> <span className="text-muted">Your design should have a logical flow, leading the viewer through a narrative. This could be the journey of interacting with a product, the evolution of a brand, or even the progression of scrolling through a website.</span></li>
                                                <li className="pb-1"><strong>Conflict & Resolution:</strong> <span className="text-muted">A good story includes a challenge and how it’s overcome. In design, this might be highlighting a problem your product solves or guiding users through a process that resolves a pain point.</span></li>
                                                <li><strong>Setting:</strong> <span className="text-muted">Visual design creates the “world” in which your story takes place. Think about how color, typography, and layout set the tone, mood, and context for your narrative.</span></li>
                                            </ul>
                                            <h5 className="fw-semibold">3. Techniques to Incorporate Storytelling in Design:</h5>
                                            <ul>
                                                <li className="pb-1"><strong>Consistent Visual Language:</strong> <span className="text-muted">Develop a cohesive visual language that aligns with the story you’re telling. This includes color schemes, typography, and iconography that reflect the brand’s identity and the message being conveyed.</span></li>
                                                <li className="pb-1"><strong>Journey Mapping:</strong> <span className="text-muted">Especially in user interface design, the user’s journey is a key aspect of storytelling. Map out how users interact with your product or website and craft that journey to be intuitive, engaging, and narrative-driven.</span></li>
                                                <li className="pb-1"><strong>Imagery and Metaphor:</strong> <span className="text-muted">Use images and icons to reinforce your story. Visual metaphors are powerful tools for conveying complex ideas simply. For example, a tree might represent growth, while a bridge can symbolize connection.</span></li>
                                                <li className="pb-1"><strong>Microinteractions:</strong> <span className="text-muted">Small animations and interactions can add a dynamic layer to your story. Think about how users react to certain actions, like hovering over a button or scrolling through content. These interactions should feel natural and enhance the narrative.</span></li>
                                                <li><strong>Typography as a Voice:</strong> <span className="text-muted">The font you choose can help set the tone for your story. Whether it’s bold and loud for a dramatic message or elegant and minimal for something more refined, typography plays a major role in how your story is perceived.</span></li>
                                            </ul>
                                            <h5 className="fw-semibold">4. Examples of Storytelling in Design:</h5>
                                            <ul>
                                                <li className="pb-1"><strong>Apple:</strong> <span className="text-muted">Apple is known for weaving storytelling into its product designs and marketing campaigns. Their product pages often take the user on a journey, explaining not just what the product is but how it fits into their lives, solving problems they didn’t even know they had.</span></li>
                                                <li className="pb-1"><strong>Airbnb:</strong> <span className="text-muted">Airbnb uses storytelling extensively through user-generated content, allowing travelers to share their personal stories. Their website design reflects this, highlighting real people, real places, and the unique experiences that come with using their service.</span></li>
                                                <li><strong>Nike:</strong> <span className="text-muted">Nike’s use of storytelling in design is legendary. Their branding, from product design to advertisements, is centered around stories of athletes overcoming obstacles, which mirrors their tagline, “Just Do It.” The design reflects these stories through bold imagery and inspiring copy.</span></li>
                                            </ul>
                                            <div>
                                                <h5 className="fw-semibold mb-3">Comments:</h5>
                                                <SimpleBar style={{height: "300px"}} className="px-3 mx-n3 mb-2">
                                                    <div className="d-flex mb-4">
                                                        <div className="flex-shrink-0">
                                                            <img src={avatar8} alt="" className="avatar-xs rounded-circle" />
                                                        </div>
                                                        <div className="flex-grow-1 ms-3">
                                                            <h5 className="fs-13">Joseph Parker <small className="text-muted ms-2">20 Dec 2021 - 05:47AM</small></h5>
                                                            <p className="text-muted">I am getting message from customers that when they place order always get error message .</p>
                                                            <Link to="#" className="badge text-muted bg-light"><i className="mdi mdi-reply"></i> Reply</Link>
                                                            <div className="d-flex mt-4">
                                                                <div className="flex-shrink-0">
                                                                    <img src={avatar10} alt="" className="avatar-xs rounded-circle" />
                                                                </div>
                                                                <div className="flex-grow-1 ms-3">
                                                                    <h5 className="fs-13">Alexis Clarke <small className="text-muted ms-2">22 Dec 2021 - 02:32PM</small></h5>
                                                                    <p className="text-muted">Please be sure to check your Spam mailbox to see if your email filters have identified the email from Dell as spam.</p>
                                                                    <Link to="#" className="badge text-muted bg-light"><i className="mdi mdi-reply"></i> Reply</Link>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="d-flex mb-4">
                                                        <div className="flex-shrink-0">
                                                            <img src={avatar6} alt="" className="avatar-xs rounded-circle" />
                                                        </div>
                                                        <div className="flex-grow-1 ms-3">
                                                            <h5 className="fs-13">Donald Palmer <small className="text-muted ms-2">24 Dec 2021 - 05:20PM</small></h5>
                                                            <p className="text-muted">If you have further questions, please contact Customer Support from the “Action Menu” on your <Link to="#" className="text-decoration-underline">Online Order Support</Link>.</p>
                                                            <Link to="#" className="badge text-muted bg-light"><i className="mdi mdi-reply"></i> Reply</Link>
                                                        </div>
                                                    </div>
                                                    <div className="d-flex">
                                                        <div className="flex-shrink-0">
                                                            <img src={avatar10} alt="" className="avatar-xs rounded-circle" />
                                                        </div>
                                                        <div className="flex-grow-1 ms-3">
                                                            <h5 className="fs-13">Alexis Clarke <small className="text-muted ms-2">26 min ago</small></h5>
                                                            <p className="text-muted">Your <Link to="#" className="text-decoration-underline">Online Order Support</Link> provides you with the most current status of your order. To help manage your order refer to the “Action Menu” to initiate return, contact Customer Support and more.</p>
                                                            <div className="row g-2 mb-3">
                                                                <div className="col-lg-1 col-sm-2 col-6">
                                                                    <img src={small4} alt="" className="img-fluid rounded" />
                                                                </div>
                                                                <div className="col-lg-1 col-sm-2 col-6">
                                                                    <img src={small5} alt="" className="img-fluid rounded" />
                                                                </div>
                                                            </div>
                                                            <Link to="#" className="badge text-muted bg-light"><i className="mdi mdi-reply"></i> Reply</Link>
                                                            <div className="d-flex mt-4">
                                                                <div className="flex-shrink-0">
                                                                    <img src={avatar6} alt="" className="avatar-xs rounded-circle" />
                                                                </div>
                                                                <div className="flex-grow-1 ms-3">
                                                                    <h5 className="fs-13">Donald Palmer <small className="text-muted ms-2">8 sec ago</small></h5>
                                                                    <p className="text-muted">Other shipping methods are available at checkout if you want your purchase delivered faster.</p>
                                                                    <Link to="#" className="badge text-muted bg-light"><i className="mdi mdi-reply"></i> Reply</Link>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </SimpleBar>
                                                <form className="mt-4">
                                                    <div className="row g-3">
                                                        <div className="col-12">
                                                            <label htmlFor="inputName" className="form-label text-body">Name</label>
                                                            <input className="form-control bg-light border-light" id="inputName" placeholder="Enter your name" required />
                                                        </div>
                                                        <div className="col-12">
                                                            <label htmlFor="exampleFormControlTextarea1" className="form-label text-body">Leave a Comments</label>
                                                            <textarea className="form-control bg-light border-light" id="exampleFormControlTextarea1" rows={3} placeholder="Enter your comment..." required></textarea>
                                                        </div>
                                                        <div className="col-12 text-end">
                                                            <button type="button" className="btn btn-ghost-secondary btn-icon waves-effect me-1"><i className="ri-attachment-line fs-16"></i></button>
                                                            <Link to="#" className="btn btn-success">Post Comments</Link>
                                                        </div>
                                                    </div>
                                                </form>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Container>
            </div>
        </React.Fragment>
    )
}

export default PageBlogOverview