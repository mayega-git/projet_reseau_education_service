/* eslint-disable @typescript-eslint/no-unused-vars */
import '@/styles/background.css';
import Header1 from '@/components/Header/Header1';
import Footer from '@/components/Footer';
import BlogPage from '@/components/Blog/HomePage';
import PublicRoute from '@/components/Routes/PublicRoute';
import Head from 'next/head';
import NavTabs from '@/components/Navigation/Navtabs';
import LandingPageWelcomeSection from '@/components/ui/LandingPageWelcomeSection';
import { fetchBlogImages, getAllBlogs } from '@/lib/FetchBlogAndPodcastData';
import { Suspense } from 'react';
import NavTabsMain from '@/components/Navigation/NavTabsMain';
import EmptyState from '@/components/EmptyState/EmptyState';

const BlogFeed = async () => {
  const allBlogData = await getAllBlogs('PUBLISHED');
  //const allBlogImages = await fetchBlogImages(allBlogData);

  if (!allBlogData || allBlogData.length === 0) {
    return (
      <div>
        <EmptyState />
      </div>
    );
  }

  return (
    <>
      <BlogPage data={allBlogData} />
    </>
  );
};
export default function Home() {
  return (
    <PublicRoute>
      <Header1 />
      <main className=" min-h-screen">
        {/* background-overlay */}
        <LandingPageWelcomeSection />

        <div className="min-h-screen flex flex-col gap-10 ">
          <NavTabsMain />

          <Suspense
            fallback={<div className="container">Loading blogs...</div>}
          >
            <BlogFeed />
          </Suspense>
        </div>
      </main>
      <Footer />
    </PublicRoute>
  );
}
