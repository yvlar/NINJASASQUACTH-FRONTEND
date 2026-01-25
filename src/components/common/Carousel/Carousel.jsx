import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Circle } from "lucide-react";
import { images } from "../../../data/images";
import styles from "./Carousel.module.css";

export default function Carousel() {
  const [index, setIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [direction, setDirection] = useState("next");

  // 🔁 Auto changement toutes les 4 secondes
  useEffect(() => {
    if (!isAutoPlay) return;

    const interval = setInterval(() => {
      setDirection("next");
      setIndex((prev) => (prev + 1) % images.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlay]);

  // ⌨️ Navigation au clavier
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [index]);

  const prev = () => {
    setDirection("prev");
    setIndex((index - 1 + images.length) % images.length);
    setIsAutoPlay(false);
  };

  const next = () => {
    setDirection("next");
    setIndex((index + 1) % images.length);
    setIsAutoPlay(false);
  };

  const goToSlide = (slideIndex) => {
    setDirection(slideIndex > index ? "next" : "prev");
    setIndex(slideIndex);
    setIsAutoPlay(false);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        {/* 🖼️ Carousel principal */}
        <div className={styles.hero}>
          <img
            key={index}
            src={images[index].url}
            alt={images[index].label}
            className={`${styles.heroImage} ${
              direction === "next" ? styles.slideInRight : styles.slideInLeft
            }`}
            loading="lazy"
          />

          {/* 🏷️ Label du jeu */}
          <div className={styles.heroLabel}>{images[index].label}</div>

          {/* ⬅️ Bouton Précédent */}
          <button
            className={`${styles.carouselBtn} ${styles.btnLeft}`}
            onClick={prev}
            aria-label="Image précédente"
          >
            <ChevronLeft size={32} />
          </button>

          {/* ➡️ Bouton Suivant */}
          <button
            className={`${styles.carouselBtn} ${styles.btnRight}`}
            onClick={next}
            aria-label="Image suivante"
          >
            <ChevronRight size={32} />
          </button>
        </div>

        {/* 🔘 Indicateurs (points) */}
        <div className={styles.indicators}>
          {images.map((_, idx) => (
            <button
              key={idx}
              className={`${styles.indicator} ${idx === index ? styles.active : ""}`}
              onClick={() => goToSlide(idx)}
              aria-label={`Aller à l'image ${idx + 1}`}
            >
              <Circle
                size={12}
                fill={idx === index ? "#077e16" : "transparent"}
                stroke="#077e16"
                strokeWidth={2}
              />
            </button>
          ))}
        </div>

        {/* 🔢 Compteur */}
        <div className={styles.counter}>
          {index + 1} / {images.length}
        </div>

        {/* ▶️ Contrôle Auto-play */}
        <div className={styles.controls}>
          <button
            className={styles.playPauseBtn}
            onClick={() => setIsAutoPlay(!isAutoPlay)}
            aria-label={isAutoPlay ? "Pause" : "Play"}
          >
            {isAutoPlay ? "⏸ Pause" : "▶ Play"}
          </button>
        </div>
      </div>
    </div>
  );
}
