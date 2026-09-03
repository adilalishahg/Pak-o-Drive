import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/mongodb';
import Review from '@/models/Review';
import Product from '@/models/Product';

export async function GET(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return NextResponse.json(
        { success: false, error: 'Valid productId is required' },
        { status: 400 }
      );
    }

    const objectId = new mongoose.Types.ObjectId(productId);

    const [reviews, statsAggregation] = await Promise.all([
      Review.find({ productId: objectId, isApproved: true })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean(),
      Review.aggregate([
        { $match: { productId: objectId, isApproved: true } },
        {
          $group: {
            _id: null,
            totalReviews: { $sum: 1 },
            averageRating: { $avg: '$rating' },
            star5: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
            star4: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
            star3: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
            star2: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
            star1: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } },
            withPhotos: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $isArray: '$images' },
                      { $gt: [{ $size: '$images' }, 0] },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
          },
        },
      ]),
    ]);

    const stats = statsAggregation[0] || {
      totalReviews: 0,
      averageRating: 5.0,
      star5: 0,
      star4: 0,
      star3: 0,
      star2: 0,
      star1: 0,
      withPhotos: 0,
    };

    return NextResponse.json({
      success: true,
      stats: {
        totalReviews: stats.totalReviews,
        averageRating: Number((stats.averageRating || 5).toFixed(1)),
        ratingBreakdown: {
          5: stats.star5,
          4: stats.star4,
          3: stats.star3,
          2: stats.star2,
          1: stats.star1,
        },
        withPhotosCount: stats.withPhotos,
      },
      reviews,
    });
  } catch (error: any) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { productId, userName, userCity, rating, title, comment, images } = body;

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return NextResponse.json(
        { success: false, error: 'Valid productId is required' },
        { status: 400 }
      );
    }

    if (!userName || !userName.trim()) {
      return NextResponse.json(
        { success: false, error: 'Your name is required' },
        { status: 400 }
      );
    }

    const numericRating = Number(rating);
    if (!numericRating || numericRating < 1 || numericRating > 5) {
      return NextResponse.json(
        { success: false, error: 'Rating must be between 1 and 5 stars' },
        { status: 400 }
      );
    }

    if (!comment || comment.trim().length < 5) {
      return NextResponse.json(
        { success: false, error: 'Please enter a review comment (minimum 5 characters)' },
        { status: 400 }
      );
    }

    const cleanImages = Array.isArray(images)
      ? images.filter((img) => typeof img === 'string' && img.trim().length > 0)
      : [];

    const newReview = await Review.create({
      productId: new mongoose.Types.ObjectId(productId),
      userName: userName.trim(),
      userCity: userCity && userCity.trim() ? userCity.trim() : 'Pakistan',
      rating: numericRating,
      title: title && title.trim() ? title.trim() : '',
      comment: comment.trim(),
      images: cleanImages,
      isVerifiedBuyer: true,
      isApproved: true,
    });

    // Update Product average rating and reviewCount
    const aggregate = await Review.aggregate([
      { $match: { productId: new mongoose.Types.ObjectId(productId), isApproved: true } },
      {
        $group: {
          _id: '$productId',
          average: { $avg: '$rating' },
          count: { $sum: 1 },
        },
      },
    ]);

    if (aggregate.length > 0) {
      await Product.findByIdAndUpdate(productId, {
        rating: Number(aggregate[0].average.toFixed(1)),
        reviewCount: aggregate[0].count,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Review submitted successfully!',
      review: newReview,
    });
  } catch (error: any) {
    console.error('Error submitting review:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
