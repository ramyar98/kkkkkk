import mongoose, { Document, Schema } from 'mongoose';

/**
 * @interface IBaseModel - پێناسەی ستاندارد بۆ هەموو مۆدێلەکانی داتابەیس
 * ئەمە یارمەتی دەدات بۆ دڵنیابوون لە ڕێکخستنی داتای دروستکراو و نوێکراو.
 */
export interface IBaseModel extends Document {
    createdAt: Date;
    updatedAt: Date;
    isActive: boolean;
}

/**
 * @const baseOptions - ڕێکخستنی ستاندارد بۆ Schema
 */
export const baseOptions = {
    timestamps: true, // بە شێوەیەکی خۆکار createdAt و updatedAt زیاد دەکات
    strict: true,     // دڵنیایی دەدات کە تەنها ئەو کێڵگانە هەبن کە پێناسە کراون
    toJSON: {
        virtuals: true,
        transform: (doc: any, ret: any) => {
            delete ret.__v;
            // دەکرێت ID بیگۆڕین بۆ string
            // ret.id = ret._id.toString();
            // delete ret._id;
            return ret;
        }
    }
};

/**
 * @function createBaseSchema - دروستکردنی بنەمایێک کە دواتر دەکرێت بەکار بهێندرێتەوە
 */
export const createBaseSchema = (schema: Record<string, any>) => {
    return new Schema<IBaseModel>(
        {
            ...schema,
            isActive: {
                type: Boolean,
                default: true,
                description: 'Status field for soft deletion or activation.'
            },
        },
        baseOptions
    );
};

// بۆ دڵنیابوون لە پەیوەندی داتابەیسەکەمان (لە سەرچاوەیەکی دەرەوە)
// mongoose.connect(process.env.MONGO_URI!); 
