import { Marquee } from "./Marquee";
import { RotationButton } from "./RotationButton";

export function Footer() {
  return (
    <footer
      id="contact"
      className="relative border-t border-border bg-flame text-ink overflow-hidden"
    >
      <div className="overflow-hidden py-10 border-b border-ink/20">
        <Marquee
          items={[
            "Building Intelligent Digital Experiences",
            "AI & Technology Brand",
            "Let's build something together",
          ]}
        />
      </div>
      <div className="relative px-6 md:px-10 py-20 grid grid-cols-1 md:grid-cols-3 gap-12">
        <div>
          <div className="font-display text-5xl inline-flex items-baseline gap-0.5">
            AYUSHDEV<span className="opacity-80">X</span>
            <sup className="text-base align-super opacity-50">®</sup>
          </div>
          <p className="mt-4 text-sm max-w-xs">
            Building intelligent applications, AI-powered tools, and digital
            products. AI product studio & technology brand.
          </p>
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-[0.25em] mb-4">Contact</h4>
          <a
            href="mailto:ayushgnarkhede0121@gmail.com"
            className="font-display text-2xl md:text-3xl block hover:underline break-all"
          >
            ayushgnarkhede0121@gmail.com
          </a>
          <p className="mt-2 text-sm">Pune, Maharashtra · India</p>

          <div className="mt-8">
            <h4 className="text-xs uppercase tracking-[0.25em] mb-4">
              Connect
            </h4>
            <ul className="space-y-2 text-lg">
              <li>
                <a
                  href="https://github.com/ayush0121n"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:underline"
                >
                  GitHub ↗
                </a>
              </li>
              <li>
                <a
                  href="https://linkedin.com/in/ayush-narkhede-946638345"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:underline"
                >
                  LinkedIn ↗
                </a>
              </li>
              <li>
                <a href="/ai-lab" className="hover:underline">
                  AI Lab ↗
                </a>
              </li>
              <li>
                <a href="/admin/login" className="hover:underline text-ink/70">
                  Admin Console ↗
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div></div>
        <div className="md:absolute md:right-10 md:top-10">
          <div className="[&_a]:!bg-ink [&_a]:!text-flame">
            <RotationButton
              text="GET IN TOUCH • EMAIL ME • "
              href="mailto:ayushgnarkhede0121@gmail.com"
            />
          </div>
        </div>
      </div>
      <div className="px-6 md:px-10 py-6 border-t border-ink/20 flex flex-col md:flex-row items-center justify-between text-xs uppercase tracking-[0.2em] gap-2">
        <span>
          © {new Date().getFullYear()} AyushDevX. All rights reserved.
        </span>
        <span>
          Building Intelligent Digital Experiences with AI & Technology.
        </span>
      </div>
    </footer>
  );
}
