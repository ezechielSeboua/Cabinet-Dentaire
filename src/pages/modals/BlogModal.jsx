// src/components/modals/BlogModal.js

import React, { useState, useEffect } from "react";
import { CgSpinner } from "react-icons/cg";
import { IoClose } from "react-icons/io5";
import { toast } from "react-toastify";

const BlogModal = ({ isOpen, onClose, onSave, initialData }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
      setContent(initialData.blogContent || "");
    } else {
      setTitle("");
      setContent("");
    }
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error("Le titre et le contenu sont obligatoires.");
      return;
    }

    setIsLoading(true);
    try {
      await onSave({
        ...initialData,
        title,
        blogContent: content,
      });
    } catch (error) {
      console.error("Save failed in modal:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    // 1. MODAL OVERLAY (The Backdrop)
    // The class was changed from `bg-black bg-opacity-60` to `bg-black/60`
    // for better reliability.
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      {/* 2. MODAL CONTENT */}
      <div
        className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-slate-600">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            {initialData ? "Modifier l'article" : "Créer un nouvel article"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full cursor-pointer text-rose-500 hover:bg-rose-500 dark:hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            <IoClose size={24} />
          </button>
        </div>

        {/* Modal Body (The Form) */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>

          <div>
            <label
              htmlFor="content"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Content
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows="10"
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            ></textarea>
          </div>

          {/* Modal Footer (Action Buttons) */}
          <div className="flex justify-end items-center pt-6 border-t border-gray-200 dark:border-slate-600 gap-3">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex cursor-pointer justify-center rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-2 text-sm font-medium text-rose-500 shadow-sm hover:bg-gray-50 dark:hover:bg-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 cursor-pointer bg-primary-700 text-white font-bold rounded-md shadow hover:bg-primary-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <CgSpinner className="animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                "Sauvegarder"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BlogModal;
