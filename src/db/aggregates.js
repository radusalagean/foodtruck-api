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
    $lookup: {
      from: 'accounts',
      localField: 'owner',
      foreignField: '_id',
      as: 'owner'
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
      foodtypes: { $first: '$foodtypes' },
      coordinates: { $first: '$coordinates' },
      image: { $first: '$image' },
      owner: { $first: {
          $arrayElemAt: [ '$owner', 0 ]
        }
      },
      created: { $first: '$created' },
      lastUpdate: { $first: '$lastUpdate' },
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
  },
  {
    $project: {
      owner: {
        hash: false,
        salt: false
      }
    }
  }
];

function readFoodtruckAggregate(id) {
  let objectId = mongoose.Types.ObjectId(id);
  let outputArray = readFoodtrucksAggregate.slice(0);
  outputArray.unshift({
    $match: {
      _id: { $eq: objectId }
    }
  });
  return outputArray;
}

function readFoodtrucksAggregateByOwner(ownerId) {
  let objectId = mongoose.Types.ObjectId(ownerId);
  let outputArray = readFoodtrucksAggregate.slice(0);
  outputArray.unshift({
    $match: {
      owner: { $eq: objectId }
    }
  });
  return outputArray;
}

export {
  readFoodtrucksAggregate,
  readFoodtruckAggregate,
  readFoodtrucksAggregateByOwner
}
