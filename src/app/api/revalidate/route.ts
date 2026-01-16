import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';

export default async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const tag = searchParams.get('tag');
  const category = searchParams.get('category');

  if (!tag && !category) {
    return NextResponse.json(
      { message: 'Missing tag or category parameter' },
      { status: 400 }
    );
  }

  // Check and trigger revalidation for the tag and category if available
  if (tag) {
    // This is where you trigger revalidation for the specific tag.
    // For example, you might use a dynamic route to revalidate a tag
    revalidateTag(`/tags/${tag}`);
  }

  if (category) {
    // This is where you trigger revalidation for the specific category.
    revalidateTag(`/categories/${category}`);
  }

  return NextResponse.json({
    revalidated: true,
    now: Date.now(),
  });
}
