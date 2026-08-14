import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const GsapReveal = ({
  as: Tag = "div",
  children,
  className = "",
  duration = 0.8,
  stagger = 0.08,
  y = 26,
  trigger,
  delay = 0,
  ...rest
}) => {
  const scope = useRef(null);

  useGSAP(
    () => {
      const targets = gsap.utils.toArray(scope.current.children);
      if (!targets.length) return;

      gsap.fromTo(
        targets,
        { y, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration,
          ease: "power3.out",
          stagger,
          delay,
          overwrite: true,
          scrollTrigger: {
            trigger: trigger || scope.current,
            start: "top 84%",
            once: true,
          },
        },
      );
    },
    { scope },
  );

  return (
    <Tag ref={scope} className={className} {...rest}>
      {children}
    </Tag>
  );
};

export default GsapReveal;