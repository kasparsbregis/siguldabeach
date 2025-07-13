import { Button } from "@/components/ui/button";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import { Volleyball } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="h-[100vh] flex flex-col tracking-tight">
      <div className="w-full border-b border-black/20">
        <Navbar />
      </div>
      <div className="container mx-auto flex-1 tracking-tighter">
        <div className="flex flex-col items-center mt-10">
          <Image
            src={"/kingofthebeach-logo.png"}
            alt="King of the Beach"
            width={200}
            height={200}
            className="mb-4 w-[200px] h-[200px]"
          />
          <div className="flex flex-col items-center justify-center -space-y-4">
            <h1 className="text-8xl font-bold text-center leading-none">
              KING
            </h1>
            <h1 className="text-7xl font-bold text-center leading-none">
              OF THE
            </h1>
            <h1 className="text-7xl font-bold text-center leading-none">
              BEACH
            </h1>
          </div>
          <p className="text-2xl text-center mt-4 w-[70%] md:w-full text-gray-700">
            Ievadiet 4 spēlētājus, izlozējiet spēļu secību un sāciet spēli!
          </p>
          <Link href="/play" className="mt-4">
            <Button
              variant={"default"}
              className="bg-black text-white hover:bg-gray-800 h-12 px-8 text-lg mt-2 w-48"
              asChild
            >
              <div>
                <Volleyball />
                Spēlēt
              </div>
            </Button>
          </Link>
        </div>
      </div>
      <div className="border-t border-black/20">
        <Footer />
      </div>
    </div>
  );
}
