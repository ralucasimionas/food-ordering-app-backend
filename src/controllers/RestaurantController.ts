import { Request, Response } from "express";
import Restaurant from "../models/Restaurant";

const searchRestaurants = async (req: Request, res: Response) => {
  try {
    //param in main search - mandatory in get request
    const city = req.params.city;

    //different optional search parameters e.g. pizza/estimatedDelivery Time, cuisine, etc. in the results from the city get
    //filters, sort options, page numer, etc
    const searchQuery = (req.query.searchQuery as string) || "";
    const selectedCuisines = (req.query.searchQuery as string) || "";
    const sortOption = (req.query.sortOption as string) || "lastUpdated";
    //pageNumber
    const page = parseInt(req.query.page as string) || 1;

    let query: any = {};

    // sets up a search pattern for the city field, i-option  => case insensitive
    query["city"] = new RegExp(city, "i");
    //countDocuments - search the Restaurant based on our query (city)
    //countDocument return the number of Restaurant from city query
    const cityCheck = await Restaurant.countDocuments(query);
    if (cityCheck === 0) {
      //we return an empty array because frontend expects an array from this response
      return res
        .status(404)
        .json({ data: [], pagination: { total: 0, page: 1, pages: 1 } });
    }

    if (selectedCuisines) {
      //getting the selected cuisines => selectedCuisines=italian,burgers,chinese from an URL
      //we create a new array by splitting it at ',' => [italian, burgers, chinese]
      //for each item we will create a new RegExp search Criteria

      const cuisinesArray = selectedCuisines
        .split(",")
        .map((cuisine) => new RegExp(cuisine, "i"));

      query["cuisines"] = { $all: cuisinesArray };
    }

    if (searchQuery) {
      //restaurantName = PizzaPalace
      //cuisines = [Pizza, pasta, italian]
      //searchQuery = pasta
      // query["$or"] checks the restaurantName aor the cuisines for searchQuery pasta
      const searchRegex = new RegExp(searchQuery, "i");
      query["$or"] = [
        { restaurantName: searchRegex },
        { cuisines: { $in: [searchRegex] } },
      ];
    }

    const pageSize = 10;
    //skip skips the results from the previous pages
    //e.g. if we are on page 2 - skip = (2-1)*10 = 10 so it will skip the first 10 results that are showed on the first page
    const skip = (page - 1) * pageSize;
    //query has all of the above
    //sortOption = lastUpdated -> it will sort by lastUpdated
    //sortOption = deiliveryTimee -> it will sort by deliveryTime e.g. all the restaurants from X city, with italian cuisine or with salads
    const restaurants = await Restaurant.find(query)
      .sort({ [sortOption]: 1 })
      .skip(skip)
      .limit(pageSize)
      //lean strips out all the ids and info coming from DB
      .lean();

    //gets the number of all the restaurants from the query
    //needed to know how many pages
    const total = await Restaurant.countDocuments(query);

    const response = {
      data: restaurants,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / pageSize),
      },
    };

    res.json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export default { searchRestaurants };
