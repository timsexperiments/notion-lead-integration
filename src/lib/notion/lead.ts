'use server';

import {
  PageObjectResponse,
  TextRichTextItemResponse,
} from '@notionhq/client/build/src/api-endpoints';
import { Lead } from '../types';
import notion from './client';

export async function fetchLeadRecords(): Promise<Lead[]> {
  const result = await notion.databases.query({
    database_id: process.env.NOTION_PAGE_ID!,
  });

  const leads: Lead[] = result.results
    .filter((result) => result.object === 'page')
    .map((result) => {
      const lead = (result as PageObjectResponse).properties;
      return {
        id: result.id,
        address: (lead.Address as { rich_text: TextRichTextItemResponse[] })
          .rich_text[0].text.content,
        name: (lead.Name as { title: TextRichTextItemResponse[] }).title[0].text
          .content,
      };
    });
  return leads;
}
