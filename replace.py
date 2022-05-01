#!/usr/bin/env python3
# -*- coding: utf-8 -*-
__author__ = 'jinmu333'

import cv2
import lib.img_function as predict
import lib.img_math as img_math
from PIL import Image, ImageTk, ImageGrab
from hyperlpr import *
import numpy as np
import sys, json

## 4个点的坐标排序，从左下角顺时针开始
def order_points(pts):
    ''' sort rectangle points by clockwise '''
    
    sort_x = pts[np.argsort(pts[:, 0]), :]
    
    Left = sort_x[:2, :]
    Right = sort_x[2:, :]
    # Left sort
    Left = Left[np.argsort(Left[:,1])[::-1], :]
    # Right sort
    Right = Right[np.argsort(Right[:,1]), :]
    
    return np.concatenate((Left, Right), axis=0)

def im_cover(im_dst_path, dst_points, im_cover_path, isReduce, ppath, dstPath):
    img_icon = cv2.imread(im_cover_path)
    im_dst = cv2.imread(im_dst_path)
    # nrows, cols = img_icon.shape
    nrows, ncols = img_icon.shape[:2]

    # 左上角开始，顺时针
    src_points = np.float32([
        [0, 0],
        [ncols, 0],
        [ncols, nrows],
        [0, nrows],
    ])
    dst_points = np.float32(dst_points)

    # 排序坐标
    orderPoints = order_points(dst_points)
    dst_points = np.float32([
        orderPoints[1],
        orderPoints[2],
        orderPoints[3],
        orderPoints[0],
    ])

    im_temp = im_dst.copy()
    # cv2.imshow("Image", im_temp)
    h = cv2.getPerspectiveTransform(src_points, dst_points)
    im_out = cv2.warpPerspective(img_icon, h, (im_temp.shape[1],im_temp.shape[0]), dst=im_temp)

    # cv2.imshow("Warped Source Image", im_out)
    pts_dst = np.int32(dst_points)

    cv2.fillConvexPoly(im_dst, pts_dst, (255, 255, 255))
    im_dst = im_dst + im_temp
    # cv2.imshow("DST", im_dst)
    cv2.imwrite(dstPath, im_dst)
    print(dstPath)

def resize(w, h, pil_image):
    w_box = 200
    h_box = 50
    f1 = 1.0*w_box/w
    f2 = 1.0*h_box/h
    factor = min([f1, f2])
    width = int(w*factor)
    height = int(h*factor)
    return pil_image.resize((width, height), Image.ANTIALIAS)

def run(ppath, dstPath): 
    pic_path = ppath
    picImg = Image.open(pic_path)

    predictor = predict.CardPredictor()
    predictor.train_svm()

    apistr = None
    img_bgr = img_math.img_read(pic_path)
    first_img, oldimg = predictor.img_first_pre(img_bgr)
    
    first_img_instance = Image.fromarray(first_img)
    oldimg_instance = Image.fromarray(first_img)
    # first_img_instance.save('/app/tmp/ax_test_first_img.png')
    # oldimg_instance.save('/app/tmp/ax_test_oldimg.png')

    r_c, roi_c, color_c, box_point = predictor.img_color_contours(first_img, oldimg, True)
    box_point1 = box_point
    r_color, roi_color, color_color, box_point =  predictor.img_only_color(oldimg, oldimg, first_img, True)

    try:
        Plate = HyperLPR_PlateRecogntion(img_bgr)
        r_c = Plate[0][0]
        r_color = Plate[0][0]
    except:
        pass
    if not color_color:
        color_color = color_c
    if not color_c:
        color_c = color_color

    # 没有识别到车牌
    if (len(str(r_color)) == 0): 
        print('没有识别到车牌: ', ppath)
        return
    # if (roi_color is not None):
        # roi = cv2.cvtColor(roi_color, cv2.COLOR_BGR2RGB)
        # roi = Image.fromarray(roi)
        # w, h = roi.size
        # roi.save('/app/tmp/ax_test_roi.png')
        # roi_resized = resize(w, h, roi)
        # roi.save('/app/tmp/ax_test_roi_resize.png')
        # pil_image_resized = self.resize(w, h, roi)

    # 车牌区域存在问题
    if (box_point is None):
        # 尝试用 box_point1
        box_point = box_point1
    if (box_point is None):
        return 

    isReduce = False # 是否比例变了
    if (picImg.size[0] >= 1000):
        isReduce = True
        rate = 1000 / picImg.size[0]
        box_point[0][0] = box_point[0][0] / rate
        box_point[0][1] = box_point[0][1] / rate
        box_point[1][0] = box_point[1][0] / rate
        box_point[1][1] = box_point[1][1] / rate
        box_point[2][0] = box_point[2][0] / rate
        box_point[2][1] = box_point[2][1] / rate
        box_point[3][0] = box_point[3][0] / rate
        box_point[3][1] = box_point[3][1] / rate
    
    im_cover(pic_path, box_point, '/app/car_pic/logo.png', isReduce, ppath=ppath, dstPath=dstPath)
    # cv2.waitKey(0)

if __name__ == '__main__':
    # s = '{"src": "/app/server/src/.cache/ganzou4.png", "dst": "/app/server/src/.cache/car_replace.png"}'
    # payload = json.loads(s)
    payload = json.loads(sys.argv[1])
    run(payload['src'], payload['dst'])