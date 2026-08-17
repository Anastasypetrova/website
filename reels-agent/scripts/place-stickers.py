"""Куда поставить стикер, чтобы он не залез на лицо и на субтитры.

Стикер живёт 1.5-2.5 с, поэтому считаю зону лица только внутри его окна,
а не по всему ролику. Беру максимум по окну с запасом — если голова
качнулась, стикер всё равно не окажется на щеке.
"""
import cv2, numpy as np, json, sys

VIDEO = sys.argv[1]
WINDOWS = [(14.0, 16.0), (33.0, 35.0), (44.0, 46.0)]  # окна-примеры

STICKER = 210          # сторона стикера в пикселях кадра 720x1280
MARGIN = 24            # отступ от краёв кадра
CAPTION_BAND = (0.14, 0.24)  # где живут субтитры, доля высоты — туда нельзя

cap = cv2.VideoCapture(VIDEO)
W = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
H = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
FPS = cap.get(cv2.CAP_PROP_FPS)
det = cv2.FaceDetectorYN.create("models/yunet.onnx", "", (W, H), 0.6, 0.3, 5000)


def face_box(t0, t1):
    """Максимальный прямоугольник лица за окно [t0, t1]."""
    cap.set(cv2.CAP_PROP_POS_FRAMES, int(t0 * FPS))
    got = []
    for _ in range(int((t1 - t0) * FPS)):
        ok, fr = cap.read()
        if not ok:
            break
        _, faces = det.detect(fr)
        if faces is None:
            continue
        for f in faces:
            x, y, w, h = [int(v) for v in f[:4]]
            px, pt, pb = int(w * 0.45), int(h * 0.65), int(h * 0.55)
            got.append([max(0, x - px), max(0, y - pt),
                        min(W, x + w + px), min(H, y + h + pb)])
    if not got:
        return None
    a = np.array(got)
    return [int(a[:, 0].min()), int(a[:, 1].min()),
            int(a[:, 2].max()), int(a[:, 3].max())]


def place(fb):
    """Лучшая позиция стикера: максимально далеко от лица, вне полосы субтитров."""
    cands = []
    for x in range(MARGIN, W - STICKER - MARGIN + 1, 10):
        for y in range(MARGIN, H - STICKER - MARGIN + 1, 10):
            box = (x, y, x + STICKER, y + STICKER)
            # запрет: полоса субтитров
            if box[3] > CAPTION_BAND[0] * H and box[1] < CAPTION_BAND[1] * H:
                continue
            # запрет: пересечение с лицом
            if fb and not (box[2] < fb[0] or box[0] > fb[2]
                           or box[3] < fb[1] or box[1] > fb[3]):
                continue
            # чем выше и чем дальше от центра лица — тем лучше
            fcx = (fb[0] + fb[2]) / 2 if fb else W / 2
            dist = abs((x + STICKER / 2) - fcx)
            cands.append((dist - y * 0.35, x, y))
    if not cands:
        return None
    cands.sort(reverse=True)
    return cands[0][1], cands[0][2]


out = []
for t0, t1 in WINDOWS:
    fb = face_box(t0, t1)
    pos = place(fb) if fb else None
    out.append({"window": [t0, t1], "face_box": fb, "sticker_xy": pos})
    print(f"{t0:.0f}-{t1:.0f}s  лицо={fb}  стикер={pos}", file=sys.stderr)

cap.release()
json.dump(out, open("ref/placement.json", "w"), ensure_ascii=False, indent=2)
print(json.dumps(out, ensure_ascii=False))
