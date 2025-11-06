"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import { MovieCard } from "@/components/MovieCard/MovieCard";
import { LoadingSpinner } from "@/components/Loading/LoadingSpinner";
import { AiFillHeart, AiOutlineHeart, AiFillStar } from "react-icons/ai";
import { useFavorites } from "@/hooks/useFavorites";
import { movieService } from "@/lib/services/movieService";
import { getYear, formatCurrency } from "@/lib/utils/text";
import type { MovieDetails, Cast, Movie } from "@/types/movie";
import Link from "next/link";

const FilmeDetalhes = () => {
  const params = useParams();
  const id = Number(params.id);
  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [cast, setCast] = useState<Cast[]>([]);
  const [similar, setSimilar] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const { isFavorite, toggleFavorite } = useFavorites();

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        setLoading(true);
        
        const [movieDetails, castData, similarData] = await Promise.all([
          movieService.getMovieDetails(id),
          movieService.getMovieCast(id),
          movieService.getSimilarMovies(id),
        ]);

        setMovie(movieDetails);
        setCast(castData);
        setSimilar(similarData);
      } catch (error) {
        console.error("Erro ao buscar detalhes do filme:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchMovieDetails();
    }
  }, [id]);

  if (loading || !movie) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <LoadingSpinner message="Carregando detalhes do filme..." size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <div className="relative h-[70vh] w-full">
        <Image
          src={movieService.getImageUrl(movie.backdrop_path)}
          fill
          alt={movie.title}
          className="object-cover opacity-40"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 -mt-[40vh] relative z-10">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-shrink-0">
            <Image
              src={movieService.getImageUrl(movie.poster_path)}
              width={300}
              height={450}
              alt={movie.title}
              className="rounded-xl shadow-2xl w-full lg:w-[300px]"
              priority
            />
          </div>

          <div className="flex-1 text-white">
            <h1 className="text-5xl font-bold mb-2">{movie.title}</h1>
            {movie.tagline && (
              <p className="text-gray-400 italic text-lg mb-4">"{movie.tagline}"</p>
            )}

            <div className="flex flex-wrap gap-4 mb-6 items-center">
              <div className="flex items-center gap-2 bg-yellow-500/20 px-3 py-1 rounded-full">
                <AiFillStar className="text-yellow-500" size={20} />
                <span className="font-bold">{movie.vote_average.toFixed(1)}</span>
                <span className="text-gray-400 text-sm">({movie.vote_count} votos)</span>
              </div>
              <span className="text-gray-400">{movie.runtime} min</span>
              {movie.release_date && (
                <span className="text-gray-400">
                  {getYear(movie.release_date)}
                </span>
              )}
              <span className="px-3 py-1 bg-green-500/20 text-green-500 rounded-full text-sm">
                {movie.status === "Released" ? "Lançado" : movie.status}
              </span>
            </div>

            <div className="flex gap-3 mb-6">
              <button
                onClick={() => toggleFavorite(movie)}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all ${
                  isFavorite(movie.id)
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-white text-black hover:bg-gray-200"
                }`}
              >
                {isFavorite(movie.id) ? (
                  <>
                    <AiFillHeart size={20} />
                    Favoritado
                  </>
                ) : (
                  <>
                    <AiOutlineHeart size={20} />
                    Favoritar
                  </>
                )}
              </button>
            </div>

            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-3">Sinopse</h2>
              <p className="text-gray-300 leading-relaxed">{movie.overview}</p>
            </div>

            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-3">Gêneros</h2>
              <div className="flex flex-wrap gap-2">
                {movie.genres.map((genre) => (
                  <span
                    key={genre.id}
                    className="px-4 py-2 bg-red-600/20 text-red-500 rounded-full border border-red-600"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>
            </div>

            {movie.budget > 0 && (
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <h3 className="text-gray-400 mb-1">Orçamento</h3>
                  <p className="text-xl font-semibold">
                    {formatCurrency(movie.budget)}
                  </p>
                </div>
                {movie.revenue > 0 && (
                  <div>
                    <h3 className="text-gray-400 mb-1">Receita</h3>
                    <p className="text-xl font-semibold">
                      {formatCurrency(movie.revenue)}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {cast.length > 0 && (
          <div className="mt-16">
            <h2 className="text-white text-3xl font-bold mb-6">Elenco Principal</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {cast.map((actor) => (
                <div key={actor.id} className="text-center">
                  {actor.profile_path ? (
                    <Image
                      src={movieService.getImageUrl(actor.profile_path)}
                      width={200}
                      height={300}
                      alt={actor.name}
                      className="rounded-xl mb-3 w-full"
                    />
                  ) : (
                    <div className="w-full h-[300px] bg-gray-800 rounded-xl mb-3 flex items-center justify-center">
                      <span className="text-gray-600 text-4xl">👤</span>
                    </div>
                  )}
                  <p className="text-white font-semibold">{actor.name}</p>
                  <p className="text-gray-400 text-sm">{actor.character}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {similar.length > 0 && (
          <div className="mt-16 mb-20">
            <h2 className="text-white text-3xl font-bold mb-6">Filmes Similares</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {similar.map((film) => (
                <Link key={film.id} href={`/movie/${film.id}`}>
                  <div className="relative group cursor-pointer">
                    <Image
                      src={movieService.getImageUrl(film.poster_path)}
                      width={300}
                      height={450}
                      alt={film.title}
                      className="rounded-xl transition-transform duration-300 group-hover:scale-105"
                    />
                    <p className="text-white font-semibold mt-2 truncate">
                      {film.title}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default FilmeDetalhes;

