import Image from "next/image";
import Link from "next/link";
import React from "react";
import { Button } from "@/components/ui/button";
import { Volleyball } from "lucide-react";

const Navbar = () => {
  return (
    <div className="w-full max-w-[800px] mx-auto px-4 py-2">
      <div className="flex justify-between items-center">
        <div>
          <Link href="/">
            <Image
              src={"/siguldabeach-logo.png"}
              alt="Logo"
              width={45}
              height={45}
              className="w-[45px] h-[45px] md:w-[60px] md:h-[60px]"
            />
          </Link>
        </div>

        <div className="flex gap-1 md:gap-2">
          <Link href="/play">
            <Button
              variant={"default"}
              size="sm"
              className="md:h-10 md:px-4 md:py-2"
              asChild
            >
              <div>
                <Volleyball size={16} className="md:w-5 md:h-5" />
                Spēlēt
              </div>
            </Button>
          </Link>
          {/* <Link href="/winners">
            <Button
              variant={"default"}
              size="sm"
              className="md:h-10 md:px-4 md:py-2 bg-orange-400 text-white hover:bg-orange-500 hover:text-white"
              asChild
            >
              <div>
                <Medal size={16} className="md:w-5 md:h-5" />
                Uzvarētāji
              </div>
            </Button>
          </Link> */}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
