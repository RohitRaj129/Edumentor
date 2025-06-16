import { UserButton } from "@stackframe/stack";
import Image from "next/image";
import Link from "next/link";
import React from "react";

function AppHeader() {
  return (
    <div className="p-3 shadow-sm flex justify-between items-center">
      <Link href={"/"}>
        <Image src={"/logo.svg"} alt="logo" width={160} height={200} />
      </Link>
      <UserButton fallbackImageUrl="/t1.avif" />
    </div>
  );
}

export default AppHeader;
