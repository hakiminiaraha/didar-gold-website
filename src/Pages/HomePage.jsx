import React from "react";

import Hero from "../components/Hero";
import TrustBar from "../components/TrustBar";
import Collections from "../components/Collections";
import FeaturedProducts from "../components/FeaturedProducts";
import DidarWorld from "../components/DidarWorld";
import Journal from "../components/Journal";
import ArtGallery from "../components/ArtGallery";
import ShopSection from "../components/ShopSection";
import Footer from "../components/Footer";

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustBar />
      <Collections />
      <FeaturedProducts />
      <DidarWorld />
      <Journal />
      <ArtGallery />
      <ShopSection />
      <Footer />
    </>
  );
}