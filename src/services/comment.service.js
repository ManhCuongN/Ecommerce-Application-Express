'use strict'

const { NotFoundError } = require('../core/error.response')
const { Comment } = require('../models/comment.model')
const { convertToObjectIdMongodb } = require('../utils/index')
const { findProduct } = require('./product.service.xxx')


class CommentService {

    static async createComment({
        productId, userId, content, parentCommentId = null
    }) {
        const newComment = new Comment({
            comment_productId: productId,
            comment_userId: userId,
            comment_content: content,
            comment_parentId: parentCommentId
        })
        let rightValue
        if (parentCommentId) {
            // reply comment
            const parentComment = await Comment.findById(parentCommentId)
            if (!parentComment) throw new NotFoundError(`Parent Comment Not Found`)

            rightValue = parentComment.comment_right
            // update Many Comment
            await Comment.updateMany({
                comment_productId: convertToObjectIdMongodb(productId),
                comment_right: { $gte: rightValue }
            },
                {
                    $inc: { comment_right: 2 }
                })

            await Comment.updateMany({
                comment_productId: convertToObjectIdMongodb(productId),
                comment_left: { $gt: rightValue }
            },
                {
                    $inc: { comment_left: 2 }
                })

        } else {
            const maxRightValue = await Comment.findOne({
                comment_productId: convertToObjectIdMongodb(productId)
            }, 'comment_right', { sort: { comment_right: -1 } })
            if (maxRightValue) {
                rightValue = maxRightValue.comment_right + 1
            } else {
                rightValue = 1
            }

        }
        //insert to comment
        newComment.comment_left = rightValue
        newComment.comment_right = rightValue + 1

        await newComment.save()
        return newComment
    }

    static async getCommentsByParentId({
        productId,
        parentCommentId = null,
        limit = 50,
        offset = 0
    }) {
        if (parentCommentId) {
            const parent = await Comment.findById(parentCommentId)
            if (!parent) throw new NotFoundError('Not found comment for product')

            const comments = await Comment.find({
                comment_productId: convertToObjectIdMongodb(productId),
                comment_left: { $gt: parent.comment_left },
                comment_right: { $lte: parent.comment_right }
            }).select({
                comment_left: 1,
                comment_right: 1,
                comment_content: 1,
                comment_parentId: 1,
                comment_userId: 1
            }).sort({
                comment_left: 1
            })

            return comments
        }
        const comments = await Comment.find({
            comment_productId: convertToObjectIdMongodb(productId),
            comment_parentId: parentCommentId
        }).select({
            comment_left: 1,
            comment_right: 1,
            comment_content: 1,
            comment_parentId: 1,
            comment_userId: 1
        }).sort({
            comment_left: 1
        })

      

        return comments
    }


    static async deleteComments({
        commentId, productId
    }) {
        //check the product exist 
        const foundProduct = await findProduct({
            product_id: productId
        })

        if (!foundProduct) throw new NotFoundError('Product Not Found')
        //1. xac dinh gia tri left va right

        const comment = await Comment.findById(commentId)
        if (!foundProduct) throw new NotFoundError('Comment Not Found')

        const leftValue = comment.comment_left
        const rightValue = comment.comment_right

        //2. tinh width
        const width = rightValue - leftValue + 1
        //3. xoa tat ca commentId con
        await Comment.deleteMany({
            comment_productId: convertToObjectIdMongodb(productId),
            comment_left: { $gte: leftValue, $lte: rightValue }
        })
        /// update left vs right
        await Comment.updateMany({
            comment_productId: convertToObjectIdMongodb(productId),
            comment_right: { $gt: rightValue }
        }, {
            $inc: { comment_right: -width }
        })

        await Comment.updateMany({
            comment_productId: convertToObjectIdMongodb(productId),
            comment_left: { $gt: rightValue }
        }, {
            $inc: { comment_left: -width }
        })
        return true
    }
}

module.exports = CommentService