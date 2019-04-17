import mongoose from 'mongoose';

const readFoodtrucksAggregate = [
  {
    $lookup: {
      from: 'reviews',
      localField: 'reviews',
      foreignField: '_id',
      as: 'reviews'
    }
  },
  {
    $unwind: {
      path: '$reviews',
      preserveNullAndEmptyArrays: true
    }
  },
  {
    $group: {
      _id: '$_id',
      name: { $first: '$name' },
      foodtype: { $first: '$foodtype' },
      coordinates: { $first: '$coordinates' },
      avgRating: { $avg: '$reviews.rating' },
      ratingCount: {
        $sum: {
          $cond: [{
              $gt: [ '$reviews', null ]
            }, 1, 0
          ]
        }
      }
    }
  }
];

function readFoodtruckAggregate() {
  const id = mongoose.Types.ObjectId(arguments[0]);
  let outputArray = readFoodtrucksAggregate.slice(0);
  outputArray.unshift({
    $match: {
      _id: { $eq: id }
    }
  });
  console.log(outputArray);
  return outputArray;
}

export {
  readFoodtrucksAggregate,
  readFoodtruckAggregate
}
