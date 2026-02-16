import React, { useMemo, useCallback, memo } from "react";
import { FixedSizeGrid as Grid } from "react-window";
import { Row, Col } from "./ui";

// Virtualized Product Grid for better performance with large datasets
const VirtualizedProductGrid = memo(
  ({
    products,
    renderProduct,
    itemsPerRow = 4,
    itemHeight = 400,
    itemWidth = 300,
    containerHeight = 600,
    gap = 16,
  }) => {
    const { columnCount, rowCount } = useMemo(() => {
      const count = Math.ceil(products.length / itemsPerRow);
      return {
        columnCount: itemsPerRow,
        rowCount: count,
      };
    }, [products.length, itemsPerRow]);

    const Cell = useCallback(
      ({ columnIndex, rowIndex, style }) => {
        const index = rowIndex * itemsPerRow + columnIndex;
        const product = products[index];

        if (!product) return null;

        return (
          <div
            style={{
              ...style,
              left: style.left + gap / 2,
              top: style.top + gap / 2,
              width: style.width - gap,
              height: style.height - gap,
            }}
          >
            {renderProduct(product, index)}
          </div>
        );
      },
      [products, itemsPerRow, renderProduct, gap],
    );

    if (products.length === 0) return null;

    // For small datasets, use regular rendering for better UX
    if (products.length <= 20) {
      return (
        <Row xs={1} sm={2} lg={3} xl={4} className="g-4">
          {products.map((product, index) => (
            <Col key={product._id || index}>
              {renderProduct(product, index)}
            </Col>
          ))}
        </Row>
      );
    }

    return (
      <div style={{ width: "100%", height: containerHeight }}>
        <Grid
          columnCount={columnCount}
          columnWidth={itemWidth + gap}
          height={containerHeight}
          rowCount={rowCount}
          rowHeight={itemHeight + gap}
          width="100%"
          itemData={products}
        >
          {Cell}
        </Grid>
      </div>
    );
  },
);

VirtualizedProductGrid.displayName = "VirtualizedProductGrid";

export default VirtualizedProductGrid;
