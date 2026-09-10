import { Metadata } from "next";
import BlogHero from "@/components/blog/BlogHero";
import FeaturedArticle from "@/components/blog/FeaturedArticle";
import BlogGrid from "@/components/blog/BlogGrid";
import { Button } from "@/components/ui/Button";
import { sql } from "@/lib/db";

export const metadata: Metadata = {
  title: "Blog | HealthGhuru — Wellness Insights",
  description: "Expert insights on Nutrition, Fitness, Sleep, and Mental Health.",
};

export const revalidate = 60;

export default async function BlogPage() {
  const articles = await sql`
    SELECT * FROM articles 
    WHERE status = 'published' AND deleted_at IS NULL
    ORDER BY publish_date DESC
  `;

  const featuredPost = articles.length > 0 ? articles[0] : null;
  const gridPosts = articles.length > 1 ? articles.slice(1) : [];

  return (
    <>
      <BlogHero />
      
      <section className="bg-surface py-12">
        <div className="site-container">
          <div className="flex flex-col lg:flex-row gap-12">
            
            {/* Main Content Area */}
            <div className="w-full lg:w-[70%] xl:w-[75%]">
              <FeaturedArticle post={featuredPost} />
              <div className="mt-8">
                <BlogGrid posts={gridPosts} />
              </div>
            </div>

            {/* Sidebar (Desktop only) */}
            <aside className="hidden lg:block lg:w-[30%] xl:w-[25%] pt-8">
              <div className="sticky top-32 bg-white rounded-2xl p-6 shadow-card border border-primary/10">
                <h3 className="font-display text-2xl text-dark mb-4">
                  Get Weekly Wellness Tips
                </h3>
                <p className="text-text-secondary text-sm mb-6 leading-relaxed">
                  Join 5,000+ health enthusiasts who receive our latest science-backed articles directly in their inbox.
                </p>
                <form className="flex flex-col gap-3">
                  <input
                    type="email"
                    placeholder="Your email address"
                    className="w-full px-4 py-3 rounded-lg border border-border bg-surface-alt focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-colors text-sm"
                    required
                  />
                  <Button variant="primary" className="w-full justify-center shadow-md text-sm py-3">
                    Subscribe
                  </Button>
                </form>
                <p className="text-xs text-text-muted mt-4 text-center">
                  No spam. Unsubscribe anytime.
                </p>
              </div>
            </aside>
            
          </div>
        </div>
      </section>
    </>
  );
}
