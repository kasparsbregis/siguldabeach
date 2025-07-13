import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const winners = () => {
  return (
    <div className="h-[100vh] flex flex-col tracking-tight">
      <div>
        <Navbar />
      </div>
      <div className="container mx-auto flex-1 tracking-tighter">
        Pagaidām šeit vēl nekā nav, jāuzgaida
      </div>
      <div className="border-t border-black/20">
        <Footer />
      </div>
    </div>
  );
};

export default winners;
