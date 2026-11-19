import { Montserrat, Roboto, Roboto_Mono } from "next/font/google";

/*
 * The deck's own type, as in the BCH BLAZE "Widget Factory" template: Roboto for the slide titles, Montserrat for
 * the words, Roboto Mono for the address. Loaded on /slides only; latin-ext carries the ō in Jōge.
 */
const roboto = Roboto({ subsets: ["latin", "latin-ext"], weight: ["700"], variable: "--font-roboto", display: "swap" });
const montserrat = Montserrat({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "700"],
  variable: "--font-montserrat",
  display: "swap",
});
const robotoMono = Roboto_Mono({
  subsets: ["latin", "latin-ext"],
  weight: ["400"],
  variable: "--font-roboto-mono",
  display: "swap",
});

export const slideFonts = [roboto.variable, montserrat.variable, robotoMono.variable].join(" ");
