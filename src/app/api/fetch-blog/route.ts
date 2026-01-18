import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const $ = cheerio.load(response.data);

    // Remove unwanted elements
    $('script, style, nav, footer, header, noscript, iframe, ad').remove();

    const title = $('title').text() || $('h1').first().text() || 'Untitled Blog';
    
    // Heuristic for finding main content
    let content = '';
    const selectors = ['article', 'main', '.post-content', '.article-content', '#content', '.content'];
    
    for (const selector of selectors) {
      const element = $(selector);
      if (element.length > 0) {
        content = element.text();
        break;
      }
    }

    if (!content) {
      // Fallback: get the body text if no common container is found
      content = $('body').text();
    }

    // Clean up content: remove extra whitespace
    const cleanContent = content.trim().replace(/\s+/g, ' ');
    const wordCount = cleanContent.split(/\s+/).filter(word => word.length > 0).length;

    return NextResponse.json({
      title,
      content: cleanContent,
      wordCount,
      readingTime: Math.ceil(wordCount / 200), // Assuming 200 wpm
    });
  } catch (error: any) {
    console.error('Error fetching blog:', error.message);
    return NextResponse.json({ error: 'Failed to fetch blog content' }, { status: 500 });
  }
}
