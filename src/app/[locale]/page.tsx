import { setRequestLocale } from 'next-intl/server';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Intro from '@/components/Intro';
import BasicInfo from '@/components/BasicInfo';
import WeatherSection from '@/components/WeatherSection';
import SeasonsSection from '@/components/SeasonsSection';
import NearbyAttractions from '@/components/NearbyAttractions';
import HistoryTimeline from '@/components/HistoryTimeline';
import PipilaStory from '@/components/PipilaStory';
import RouteSection from '@/components/RouteSection';
import HoursSection from '@/components/HoursSection';
import TicketsSection from '@/components/TicketsSection';
import TransportSection from '@/components/TransportSection';
import VisitPlansSection from '@/components/VisitPlansSection';
import PracticalInfoSection from '@/components/PracticalInfoSection';
import VisitorGuidelines from '@/components/VisitorGuidelines';
import Gallery from '@/components/Gallery';
import Reviews from '@/components/Reviews';
import FaqSection from '@/components/FaqSection';
import MapEmbed from '@/components/MapEmbed';
import SourcesSection from '@/components/SourcesSection';
import Footer from '@/components/Footer';
import PwaInstaller from '@/components/PwaInstaller';

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Header />
      <main>
        <Hero />
        <Intro />
        <BasicInfo />
        <WeatherSection />
        <SeasonsSection />
        <NearbyAttractions />
        <HistoryTimeline />
        <PipilaStory />
        <RouteSection />
        <HoursSection />
        <TicketsSection />
        <TransportSection />
        <VisitPlansSection />
        <PracticalInfoSection />
        <VisitorGuidelines />
        <Gallery />
        <Reviews />
        <FaqSection />
        <MapEmbed />
        <SourcesSection />
      </main>
      <Footer />
      <PwaInstaller />
    </>
  );
}
