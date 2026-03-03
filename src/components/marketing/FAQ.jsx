import * as React from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const faqs = [
  {
    question: 'What asset classes does Investo support?',
    answer:
      'Investo supports Indian mutual funds, Indian stocks (NSE/BSE), US stocks, cryptocurrency, gold, and manual entries for debt, real estate, and cash holdings.',
  },
  {
    question: 'Is Investo free to use?',
    answer:
      'Yes, Investo is completely free for personal use. We use free-tier APIs (mfapi.in, CoinGecko, Alpha Vantage) for market data, which have generous limits for individual investors.',
  },
  {
    question: 'What is XIRR and why does it matter?',
    answer:
      'XIRR (Extended Internal Rate of Return) calculates your true annualized return accounting for the timing and amounts of all your investments. Unlike simple absolute returns, XIRR gives you an accurate picture when you have SIPs, multiple buy/sell transactions, or irregular investments.',
  },
  {
    question: 'Do I need API keys to use Investo?',
    answer:
      'For basic mutual fund tracking, no API key is needed. For stocks (Alpha Vantage) and crypto (CoinGecko), you\'ll need free API keys which can be obtained in seconds from their websites. We provide setup instructions in the Settings page.',
  },
  {
    question: 'Is my financial data secure?',
    answer:
      'Your portfolio data is stored securely in Firebase with authentication. API keys are stored locally on your browser. Investo never sends your financial data to any third-party servers — all calculations happen client-side.',
  },
  {
    question: 'Can I track my SIPs?',
    answer:
      'Yes! You can add individual SIP transactions with dates and amounts. Investo will automatically calculate your XIRR, total invested amount, and current value for each SIP holding.',
  },
];

export default function FAQ() {
  const [expanded, setExpanded] = React.useState(false);

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <Container
      id="faq"
      sx={{
        pt: { xs: 4, sm: 12 },
        pb: { xs: 8, sm: 16 },
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: { xs: 3, sm: 6 },
      }}
    >
      <Typography
        component="h2"
        variant="h4"
        sx={{
          color: 'text.primary',
          width: { sm: '100%', md: '60%' },
          textAlign: { sm: 'left', md: 'center' },
          fontWeight: 700,
        }}
      >
        Frequently asked questions
      </Typography>
      <Box sx={{ width: '100%' }}>
        {faqs.map((faq, index) => (
          <Accordion
            key={index}
            expanded={expanded === `panel${index}`}
            onChange={handleChange(`panel${index}`)}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls={`panel${index}-content`}
              id={`panel${index}-header`}
            >
              <Typography component="span" variant="subtitle2" sx={{ fontWeight: 600 }}>
                {faq.question}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography
                variant="body2"
                sx={{ maxWidth: { sm: '100%', md: '70%' }, color: 'text.secondary' }}
              >
                {faq.answer}
              </Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    </Container>
  );
}
