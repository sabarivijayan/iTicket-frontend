import MovieCarousel from "@/components/MovieCarousel/MovieCarousel";
import styles from "./page.module.css";
import MovieSlider from "@/components/MovieSlider/MovieSlider";

export default function Home() {
  return (
      <main className={styles.main}>
        <MovieSlider/>
        <MovieCarousel/>
      </main>
  );
}
