import Image from "next/image";
import { User } from "lucide-react";

import { cn } from "@/lib/utils";

const SIGN_IN_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDslt6e6UKtsNpnB6iQETya2ZccdJmP-6-JFhRQV7Z8UslURuzRZvM46L11N5ie5eOOWOrmn9m1CEVGGxSQVDK0PDAuU63boqGBRnJNMpwgFci2bKro1pqAGvNDRhI8Vy53YpTqcXU6Lk98knITg1i6nkmZoZOFMFwF20myDoCvi3uH-jnIQ_F7_yCUEZLy1QuMhESeJA21irq4MH08QYNAVR8WDRASPoTQlPVMycif524EfFseVJIoEpTfLnEiFnf-LzjsYggjXng";

const SIGN_UP_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAnp2NOF3ElJP7EEKmabUImLvspjBkuxrEUdBVVIC2LrgM9f6zfTp6mmrFN3C0DkKrzdQ_lcgnXlu9LKQGir8N_3qanjPXcFM5Im9-hL9zTts76GzFtC5PzcObYfSsuDIfjA1yk3y2Ar4mGlyfLxzrNFWmAhyT_JwRAKtugaWnSVVWv7_Dsns354KqW-9n-0dE1qsxRY4l2lzdSykBXyJIHXZ976CPKSNpLYdYHbnVemHlvBvPSib6697w344-FvspK6acnQ8Qzo8M";

const SIGNUP_AVATARS = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDjLxtyl6kRYuuvVX5nT6b_0qy9t1yBmR9ZeYlPwE2H1VRUNmCw9Q__4urE5Vv9Lb6dfYejHSWNnPGYH-SSCMIhdUMw7kDy8zKdEYOMsT0mXJQbuvdlbY_-UjefbnFhoGxk2w3EPCkOBa0BWKGAL2KgvhMO08SzWGga0OdLcoPoqp40zKdlHGuDiE1Lr9tucgBcZWQbTXPjKt6-y1FYlE01jNeB1lpPw_wvyla8SnT-_FyA7logiz6htetSkjw-7K_GouQFyo0k7-Y",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCKbhrqylNnUSvmN3HNBRrfSSThmlVNirdvtddIqVtNrys-FiGTNR6XDs-SMXD4RAVCZ5CBPaJdVSD6xziX_b6Mi8fMuWSb_NDhgHqKRJrt8Y6ugqYmhYyeckc6I7i_UgWPhZmVC6_b4Mcp8fpbFqYWdYjBtHec37qnNBFv11bnULbNjqIWQWzKGCmAohEeL5ilCxDrU2RukOZUTKH4hn7F80x1LIabhnw_zmgpokszcpQiddYK7D9v_fpbGlv_f3EiTc3XoEV0qpw",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCFc03J7WUX7sY4YjgBJG4bF0H6fRGcYVWoMT8EVLXbYMg-b7NO7vqK0gcOJ-0ZmwSA1VDhRPaDSChpLZSIrehKtmBG5G_uGClOkesaKOHY2-C2d0_DDuq8GDpI-A5wQk0jvW8ul5dS9zamTCpHvcLaKh1FCn7ZLITkj2tNkAbhDXrrrtgBPywLjv5HZslOC2b-QbPeiFN_959wKIlXTbItHaIJ4uVb7xroEQJSad1pftSWNtIfh-EDftDFBFZRsQnaqieOTNodGp8",
] as const;

type AuthBrandPanelProps = {
  variant: "signin" | "signup";
};

export function AuthBrandPanel({ variant }: AuthBrandPanelProps) {
  const isSignup = variant === "signup";

  return (
    <div
      className={cn(
        "relative hidden flex-col overflow-hidden bg-[#0A0A0A] lg:flex",
        isSignup ? "lg:w-[45%]" : "lg:w-1/2",
      )}
    >
      <Image
        src={isSignup ? SIGN_UP_IMAGE : SIGN_IN_IMAGE}
        alt=""
        fill
        priority
        className={cn(
          "object-cover",
          isSignup ? "opacity-30" : "grayscale-[20%]",
        )}
        sizes="50vw"
        unoptimized
      />
      <div
        className={cn(
          "absolute inset-0",
          isSignup
            ? "bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/80 to-transparent"
            : "bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/60 to-transparent",
        )}
      />

      {isSignup ? (
        <div className="relative z-10 flex items-center gap-2 p-12">
          <div className="flex size-8 items-center justify-center rounded-lg bg-white text-sm font-bold text-[#0A0A0A]">
            T
          </div>
          <span className="text-xl font-semibold tracking-tight text-white">
            TYR
          </span>
        </div>
      ) : null}

      <div
        className={cn(
          "relative z-10 mt-auto max-w-xl p-8 md:p-10",
          isSignup ? "mb-0 pb-12" : "mb-12",
        )}
      >
        {!isSignup ? (
          <div className="mb-6 h-1 w-12 bg-[#2055FD]" />
        ) : null}
        <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-white md:text-5xl md:leading-[56px]">
          Precision Engineering
          <br />
          For Your Career.
        </h2>
        <p
          className={cn(
            "mt-4 text-base leading-7 md:text-lg md:leading-7",
            isSignup ? "text-[#e4e2e2]/90" : "mb-8 text-[#e9e8e7]",
          )}
        >
          {isSignup
            ? "Join an elite network of professionals using AI-driven insights to construct ATS-proof resumes with mathematical precision."
            : "Leverage LaTeX formatting and AI-driven ATS optimization to build a resume that commands authority."}
        </p>

        <div
          className={cn(
            "flex items-center gap-3",
            isSignup ? "mt-6 border-t border-white/20 pt-6" : "",
          )}
        >
          <div className="flex -space-x-3">
            {isSignup
              ? SIGNUP_AVATARS.map((src) => (
                  <Image
                    key={src}
                    src={src}
                    alt=""
                    width={40}
                    height={40}
                    className="size-10 rounded-full border-2 border-[#0A0A0A] object-cover"
                    unoptimized
                  />
                ))
              : (
                <>
                  <div className="flex size-10 items-center justify-center overflow-hidden rounded-full border-2 border-[#0A0A0A] bg-[#e4e2e2]">
                    <User className="size-4 text-[#6B6B6B]" />
                  </div>
                  <div className="flex size-10 items-center justify-center overflow-hidden rounded-full border-2 border-[#0A0A0A] bg-[#e4e2e2]">
                    <User className="size-4 text-[#6B6B6B]" />
                  </div>
                  <div className="flex size-10 items-center justify-center rounded-full border-2 border-[#0A0A0A] bg-[#2055FD] text-[11px] font-semibold text-white">
                    10k+
                  </div>
                </>
              )}
          </div>
          <p className="ml-2 text-sm text-[#e9e8e7]">
            {isSignup ? (
              <>
                Trusted by{" "}
                <span className="font-semibold text-white">10,000+</span> Indian
                job seekers
              </>
            ) : (
              "Trusted by Indian job seekers."
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
