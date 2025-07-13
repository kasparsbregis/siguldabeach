import { Button } from "@/components/ui/button";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import { Volleyball } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="h-[100vh] flex flex-col tracking-tight">
      <div className="w-full border-b border-black/20">
        <Navbar />
      </div>
      <div className="container mx-auto flex-1 tracking-tighter">
        <div className="flex flex-col items-center justify-center h-full">
          <h1 className="text-3xl font-bold text-center ">KINGOFTHEBEACH</h1>
          <p className="text-lg text-center mt-4">
            Ievadiet 4 spēlētājus, izlozējiet spēļu secību un sāciet spēli!
          </p>
          <Link href="/play" className="mt-4">
            <Button
              variant={"default"}
              size="sm"
              className="md:h-10 md:px-4 md:py-2"
              asChild
            >
              <div>
                <Volleyball size={32} className="md:w-5 md:h-5" />
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
