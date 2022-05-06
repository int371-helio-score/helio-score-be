import { Injectable } from '@nestjs/common';

@Injectable()
export class ScoreService {
  // constructor(
  //   @InjectRepository(Subject)
  //   private repo: MongoRepository<Subject>,
  // ) { }

  async getScore(subjectId: string, ownerId: string, scoreTitle: string) {
    
    // const result = await this.repo.aggregate([
    //   { $match: { _id: subjectId } }
    // ])
    // const result = await this.repo.aggregate([
    //   { $match: { _id: subjectId, owner: ownerId } },
    //   {
    //     $lookup: {
    //       from: "class",
    //       localField: "_id",
    //       foreignField: "subjectId",
    //       as: "class"
    //     }
    //   },
    //   { $unwind: "$class" },
    //   {
    //     $lookup: {
    //       from: "group",
    //       localField: "class.member.groupId",
    //       foreignField: "_id",
    //       as: "group"
    //     }
    //   },
    //   { $unwind: "$group" },
    //   {
    //     $lookup: {
    //       from: "listmember",
    //       localField: "group._id",
    //       foreignField: "groupId",
    //       as: "member"
    //     }
    //   },
    //   { $unwind: "$member" },
    //   {
    //     $lookup: {
    //       from: "score",
    //       let: { stdId: "$member.studentId" },
    //       pipeline: [
    //         {
    //           $match: {
    //             $expr: {
    //               $and: [
    //                 { $eq: ["$studentId", "$$stdId"] },
    //                 { $eq: ["$title", scoreTitle] }
    //               ]
    //             }
    //           }
    //         }
    //       ],
    //       as: "score"
    //     }
    //   }
    // ])

    // console.log(result);



    // return result

  }
}
