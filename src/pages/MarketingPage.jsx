import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import AppTheme from '../shared-theme/AppTheme';
import AppAppBar from '../components/marketing/AppAppBar';
import Hero from '../components/marketing/Hero';
import Features from '../components/marketing/Features';
import Highlights from '../components/marketing/Highlights';
import FAQ from '../components/marketing/FAQ';
import Footer from '../components/marketing/Footer';

export default function MarketingPage(props) {
  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <AppAppBar />
      <Hero />
      <div>
        <Features />
        <Divider />
        <Highlights />
        <Divider />
        <FAQ />
        <Divider />
        <Footer />
      </div>
    </AppTheme>
  );
}
