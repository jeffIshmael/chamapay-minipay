"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { FiX, FiLink } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { getChamaBySlug } from "@/lib/chama";

const ChamaLinkSearch = ({ onClose }: { onClose: () => void }) => {
  const [link, setLink] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Basic validation
    if (!link) {
      setError("Please paste a chama link");
      setIsLoading(false);
      return;
    }

    // Extract slug from different URL formats:
    let slug;
    if (link.includes("/Chama/")) {
      slug = link.split("/Chama/")[1].split("/")[0];
    } else if (link.includes("/chama/")) {
      slug = link.split("/chama/")[1].split("/")[0];
    } else {
      // Assume it's just the slug if no domain
      slug = link.split("/").pop();
    }

    // Clean up any query parameters or hashes
    slug = slug?.split("?")[0].split("#")[0];

    if (slug) {
      // check if chama exists
      const chama = await getChamaBySlug(slug);
      if (!chama) {
        setError("Chama not found");
        setIsLoading(false);
        return;
      }

      router.push(`/Chama/${slug}`);
    } else {
      setError("Invalid chama link format");
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-xl p-6 w-full max-w-sm"
      >
       
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-bold">Search for a private chama</h3>
          <button
            onClick={onClose}
            className={`text-gray-500 hover:text-gray-700 bg-transparent border-none hover:bg-gray-200 rounded-full p-2 ${
              isLoading ? "cursor-not-allowed hover:bg-transparent hover:text-gray-500" : ""
            }`}
            disabled={isLoading}
          >
            <FiX size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className=" text-red-500 p-1 rounded-md mb-2">
              {error}
            </div>
          )}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiLink className="text-gray-400" />
            </div>
            <input
              type="text"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="Paste chama invite link"
              className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-downy-500 focus:border-downy-500"
            />
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 border border-gray-300 rounded-lg ${
                isLoading  ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-4 py-2 bg-downy-500 text-white rounded-lg hover:bg-downy-600 ${
                isLoading || !link ? "opacity-50 cursor-not-allowed " : ""
              }`}
              disabled={isLoading || !link}
            >
              {isLoading ? "Searching..." : "Search"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ChamaLinkSearch;
