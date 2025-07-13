import React from "react";

const Footer = () => {
  return (
    <div className="w-full items-center justify-center flex mx-auto text-[10px]">
      © {new Date().getFullYear()}. Lapu izstrādāja Kaspars Breģis.
    </div>
  );
};

export default Footer;
