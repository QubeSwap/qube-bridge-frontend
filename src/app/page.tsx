'use client'

import { useRouter } from "next/navigation";
import { useEffect } from "react";

function Page() {
  const router = useRouter();

  useEffect(()=>{
    router.push("/main")
     },[router])

  return (
    <div className="flex w-full h-full justify-center items-center">
    </div>
  );
}

export default Page;
