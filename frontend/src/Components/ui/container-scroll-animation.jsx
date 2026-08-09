import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export const ContainerScroll = ({ titleComponent, children }) => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 92%", "center 52%"],
  });
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const rotate = useTransform(scrollYProgress, [0, 1], [20, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], isMobile ? [0.7, 0.9] : [1.05, 1]);
  const translate = useTransform(scrollYProgress, [0, 1], [0, -100]);

  return (
    <div
      className="relative flex h-[34rem] items-start justify-center overflow-hidden px-4 pt-0 md:h-[48rem] md:px-16 md:pt-0"
      ref={containerRef}
    >
      <div className="relative z-10 w-full py-0 md:py-0" style={{ perspective: "1000px" }}>
        {titleComponent ? <Header translate={translate} titleComponent={titleComponent} /> : null}
        <Card rotate={rotate} scale={scale}>
          {children}
        </Card>
      </div>
    </div>
  );
};

export const Header = ({ translate, titleComponent }) => {
  return (
    <motion.div
      style={{ translateY: translate }}
      className="mx-auto max-w-5xl text-center"
    >
      {titleComponent}
    </motion.div>
  );
};

export const Card = ({ rotate, scale, children }) => {
  return (
    <motion.div
      style={{
        rotateX: rotate,
        scale,
        boxShadow:
          "0 0 #0000004d, 0 9px 20px #00000024, 0 37px 37px #0000001f, 0 84px 50px #00000014, 0 149px 60px #00000008",
      }}
      className="mx-auto mt-0 h-[28rem] w-full max-w-[280px] rounded-[36px] border-[5px] border-[#253342] bg-[#17212B] p-1.5 shadow-2xl sm:h-[32rem] sm:max-w-[320px] md:h-[40rem] md:max-w-6xl md:rounded-[30px] md:border-4 md:p-5"
    >
      <div className="h-full w-full overflow-hidden rounded-[28px] md:rounded-2xl bg-[#F8FBFF]">
        {children}
      </div>
    </motion.div>
  );
};
