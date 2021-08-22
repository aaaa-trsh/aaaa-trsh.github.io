// function to find all intersection points between a line and a circle

function sign(x) {
    return x == 0 ? 1 : Math.sign(x);
}

function getLookaheadPointGH(robotPos, lookaheadDistance) {
    var lookaheadPoint = null;

    // iterate through all pairs of points
    for (var i = 0; i < path.length - 1; i++) {
        // form a segment from each two adjacent points
        var segmentStart = path.get(i);
        var segmentEnd = path.get(i + 1);

        // translate the segment to the origin
        var p1 = segmentStart.sub(robotPos);
        var p2 = segmentEnd.sub(robotPos);

        // calculate an intersection of a segment and a circle with radius r (lookahead) and origin (0, 0)
        var difference = p2.sub(p1);
        var d = difference.length();
        var D = p1.x * p2.y - p2.x * p1.y;

        // if the discriminant is zero or the points are equal, there is no intersection
        var discriminant = lookaheadDistance * lookaheadDistance * d * d - D * D;
        if (discriminant < 0 || p1.equals(p2)) continue;

        // the x components of the intersecting points
        var x1 = (D * dy + sign(dy) * dx * Math.sqrt(discriminant)) / (d * d);
        var x2 = (D * dy - sign(dy) * dx * Math.sqrt(discriminant)) / (d * d);

        // the y components of the intersecting points
        var y1 = (-D * dx + Math.abs(dy) * Math.sqrt(discriminant)) / (d * d);
        var y2 = (-D * dx - Math.abs(dy) * Math.sqrt(discriminant)) / (d * d);

        // whether each of the intersections are within the segment (and not the entire line)
        var validIntersection1 = Math.min(p1.x, p2.x) < x1 && x1 < Math.max(p1.x, p2.x) || 
            Math.min(p1.y, p2.y) < y1 && y1 < Math.max(p1.y, p2.y);
        var validIntersection2 = Math.min(p1.x, p2.x) < x2 && x2 < Math.max(p1.x, p2.x) || 
            Math.min(p1.y, p2.y) < y2 && y2 < Math.max(p1.y, p2.y);

        // remove the old lookahead if either of the points will be selected as the lookahead
        if (validIntersection1 || validIntersection2) lookaheadPoint = null;

        // select the first one if it's valid
        if (validIntersection1) {
            lookaheadPoint = robotPos.add(new Vector2(x1, y1));
        }

        // select the second one if it's valid and either lookahead is none,
        // or it's closer to the end of the segment than the first intersection
        if (validIntersection2) {
            if (lookaheadPoint == null || Math.abs(x1 - p2.x) > Math.abs(x2 - p2.x) || Math.abs(y1 - p2.y) > Math.abs(y2 - p2.y)) {
                lookaheadPoint = robotPos.add(new Vector2(x2, y2));
            }
        }
    }

    // special case for the very last point on the path
    if (path.length > 0) {
        var lastPoint = path[path.length - 1];

        // if we are closer than lookahead distance to the end, set it as the lookahead
        if (robotPos.dist(lastPoint) <= lookaheadDistance) {
            return lastPoint;
        }
    }

    return lookaheadPoint;
}

function getLookaheadPointGH2(x, y, r) {
    var lookahead = null;

    // iterate through all pairs of points
    for (var i = 0; i < path.size() - 1; i++) {
        // form a segment from each two adjacent points
        var segmentStart = path[i].toArray();
        var segmentEnd = path[i + 1].toArray();

        // translate the segment to the origin
        var p1 = [segmentStart[0] - x, segmentStart[1] - y];
        var p2 = [segmentEnd[0] - x, segmentEnd[1] - y];

        // calculate an intersection of a segment and a circle with radius r (lookahead) and origin (0, 0)
        var dx = p2[0] - p1[0];
        var dy = p2[1] - p1[1];
        var d = Math.sqrt(dx * dx + dy * dy);
        var D = p1[0] * p2[1] - p2[0] * p1[1];

        // if the discriminant is zero or the points are equal, there is no intersection
        var discriminant = r * r * d * d - D * D;
        if (discriminant < 0 || Arrays.equals(p1, p2)) continue;

        // the x components of the intersecting points
        var x1 = (D * dy + signum(dy) * dx * Math.sqrt(discriminant)) / (d * d);
        var x2 = (D * dy - signum(dy) * dx * Math.sqrt(discriminant)) / (d * d);

        // the y components of the intersecting points
        var y1 = (-D * dx + Math.abs(dy) * Math.sqrt(discriminant)) / (d * d);
        var y2 = (-D * dx - Math.abs(dy) * Math.sqrt(discriminant)) / (d * d);

        // whether each of the intersections are within the segment (and not the entire line)
        var validIntersection1 = Math.min(p1[0], p2[0]) < x1 && x1 < Math.max(p1[0], p2[0])
            || Math.min(p1[1], p2[1]) < y1 && y1 < Math.max(p1[1], p2[1]);
        var validIntersection2 = Math.min(p1[0], p2[0]) < x2 && x2 < Math.max(p1[0], p2[0])
            || Math.min(p1[1], p2[1]) < y2 && y2 < Math.max(p1[1], p2[1]);

        // remove the old lookahead if either of the points will be selected as the lookahead
        if (validIntersection1 || validIntersection2) lookahead = null;

        // select the first one if it's valid
        if (validIntersection1) {
            lookahead = [x1 + x, y1 + y];
        }

        // select the second one if it's valid and either lookahead is none,
        // or it's closer to the end of the segment than the first intersection
        if (validIntersection2) {
            if (lookahead == null || Math.abs(x1 - p2[0]) > Math.abs(x2 - p2[0]) || Math.abs(y1 - p2[1]) > Math.abs(y2 - p2[1])) {
                lookahead = [x2 + x, y2 + y];
            }
        }
    }

    // special case for the very last point on the path
    if (path.size() > 0) {
        var lastPoint = path[path.length - 1];

        var endX = lastPoint[0];
        var endY = lastPoint[1];

        // if we are closer than lookahead distance to the end, set it as the lookahead
        if (Math.sqrt((endX - x) * (endX - x) + (endY - y) * (endY - y)) <= r) {
            return [endX, endY];
        }
    }

    return new Vector2(lookahead[0], lookahead[1]);
}