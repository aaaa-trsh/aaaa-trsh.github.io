import cv2
import random

files = [
    './static/img/goodRGB4.png',
    './static/img/goodRGB5.png',
]

slice_size = (64, 64)

images = [cv2.imread(file) for file in files]

frames = []
for img in images:
    print(img.shape)
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    for col in range(img.shape[1] // slice_size[1]):
        for row in range(img.shape[0] // slice_size[0]):
            # cv2.imwrite(f'./{col}_{row}.png', img[row*slice_size[0]:(row+1)*slice_size[0], col*slice_size[1]:(col+1)*slice_size[1]])
            frames.append(img[row*slice_size[0]:(row+1)*slice_size[0], col*slice_size[1]:(col+1)*slice_size[1]])

random.shuffle(frames)

# make gif
import imageio
imageio.mimsave('./goodRGB.gif', frames, fps=10)
