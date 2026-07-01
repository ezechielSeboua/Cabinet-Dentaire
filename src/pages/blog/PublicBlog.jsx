import { useEffect, useState } from "react";
import { getPublicBlogs } from "../../services/cdiService";

const ITEMS_PER_PAGE = 3;

export default function PublicBlog({ onHasContent }) {
  const [blogs, setBlogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [popupItem, setPopupItem] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    getPublicBlogs()
      .then(({ data }) => {
        setBlogs(data);
        onHasContent?.(data.length > 0);
      })
      .catch(() => {
        setFetchError(true);
        onHasContent?.(false);
      })
      .finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!popupItem) return;
    const onKey = (e) => { if (e.key === "Escape") setPopupItem(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [popupItem]);

  const totalPages = Math.ceil(blogs.length / ITEMS_PER_PAGE);
  const currentBlogs = blogs.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
        <section className="bg-white dark:bg-gray-800">
          <div className="container mx-auto px-4 py-8 sm:py-12 lg:py-16">

            <div className="text-center mb-8 sm:mb-12 lg:mb-16">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3">
                <span className="text-primary-600">Conseils Bucco-dentaires</span>
              </h2>
              <div className="mx-auto w-24 h-1 bg-primary-500 rounded-full" />
            </div>

            {/* Loading skeleton */}
            {isLoading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-64 bg-gray-100 dark:bg-gray-700 rounded-xl animate-pulse" />
                ))}
              </div>
            )}

            {/* Error state */}
            {!isLoading && fetchError && (
              <div className="text-center py-16 text-gray-500 dark:text-gray-400">
                <p className="text-lg mb-4">Impossible de charger les conseils.</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-full text-sm transition-colors"
                >
                  Réessayer
                </button>
              </div>
            )}

            {/* Empty state */}
            {!isLoading && !fetchError && blogs.length === 0 && (
              <div className="text-center py-16 text-gray-400 dark:text-gray-500">
                <p className="text-lg">Aucun conseil disponible pour le moment.</p>
              </div>
            )}

            {/* Blog grid */}
            {!isLoading && !fetchError && blogs.length > 0 && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8">
                  {currentBlogs.map((blogItem) => (
                    <div
                      key={blogItem.id}
                      className="group transform transition-all duration-300 hover:-translate-y-1"
                    >
                      <div className="h-full bg-white dark:bg-gray-700 rounded-xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-600 hover:shadow-xl transition-shadow">
                        <div className="p-6 sm:p-7 lg:p-8">
                          <h3 className="text-xl md:text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100 line-clamp-2">
                            {blogItem.title}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-300 mb-6 line-clamp-3">
                            {blogItem.blogContent}
                          </p>
                          <button
                            onClick={() => setPopupItem(blogItem)}
                            className="w-full px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50"
                          >
                            En savoir plus
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination — only when more than 1 page */}
                {totalPages > 1 && (
                  <div className="mt-12 flex justify-center">
                    <nav className="flex items-center gap-1">
                      <button
                        onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed dark:text-gray-200"
                      >
                        Précédent
                      </button>

                      {Array.from({ length: totalPages }).map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentPage(i + 1)}
                          className={`px-4 py-2 rounded-lg ${
                            currentPage === i + 1
                              ? "bg-primary-600 text-white"
                              : "border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-200"
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}

                      <button
                        onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed dark:text-gray-200"
                      >
                        Suivant
                      </button>
                    </nav>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </div>

      {/* Detail modal */}
      {popupItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setPopupItem(null); }}
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="sticky top-0 bg-white dark:bg-gray-800 p-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
              <h4 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                Détails du conseil
              </h4>
              <button
                onClick={() => setPopupItem(null)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Fermer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="overflow-y-auto p-6">
              <article className="prose dark:prose-invert max-w-none">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">
                  {popupItem.title}
                </h2>
                <div className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                  {popupItem.blogContent}
                </div>
              </article>
            </div>
            <div className="sticky bottom-0 bg-white dark:bg-gray-800 p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
              <button
                onClick={() => setPopupItem(null)}
                className="px-6 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
