import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TableBody,
  TableCell,
  TableRow,
  TextField
} from "@material-ui/core";
import ConfirmButton, {
  ConfirmButtonTransitionState
} from "@saleor/components/ConfirmButton";
import ResponsiveTable from "@saleor/components/ResponsiveTable";
import TableCellAvatar from "@saleor/components/TableCellAvatar";
import useSearchQuery from "@saleor/hooks/useSearchQuery";
import { buttonMessages } from "@saleor/intl";
import { maybe } from "@saleor/misc";
import { SearchVariants_search_edges_node } from "@saleor/searches/types/SearchVariants";
import useScrollableDialogStyle from "@saleor/styles/useScrollableDialogStyle";
import { DialogProps, FetchMoreProps } from "@saleor/types";
import React from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { FormattedMessage, useIntl } from "react-intl";

import Checkbox from "../Checkbox";
import { messages } from "./messages";
import { useStyles } from "./styles";

export interface AssignVariantDialogFormData {
  variants: SearchVariants_search_edges_node[];
  query: string;
}
export interface AssignVariantDialogProps extends FetchMoreProps, DialogProps {
  confirmButtonState: ConfirmButtonTransitionState;
  variants: SearchVariants_search_edges_node[];
  loading: boolean;
  onFetch: (value: string) => void;
  onSubmit: (data: string[]) => void;
}

function handleVariantAssign(
  variantID: string,
  isSelected: boolean,
  selectedVariants: string[],
  setSelectedVariants: (data: string[]) => void
) {
  if (isSelected) {
    setSelectedVariants(
      selectedVariants.filter(
        selectedVariants => selectedVariants !== variantID
      )
    );
  } else {
    setSelectedVariants([...selectedVariants, variantID]);
  }
}

const scrollableTargetId = "assignVariantScrollableDialog";

const AssignVariantDialog: React.FC<AssignVariantDialogProps> = props => {
  const {
    confirmButtonState,
    hasMore,
    open,
    loading,
    variants,
    onClose,
    onFetch,
    onFetchMore,
    onSubmit
  } = props;
  const classes = useStyles(props);
  const scrollableDialogClasses = useScrollableDialogStyle({});

  const intl = useIntl();
  const [query, onQueryChange] = useSearchQuery(onFetch);
  const [selectedVariants, setSelectedVariants] = React.useState<string[]>([]);

  const handleSubmit = () => onSubmit(selectedVariants);

  return (
    <Dialog
      onClose={onClose}
      open={open}
      classes={{ paper: scrollableDialogClasses.dialog }}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>
        <FormattedMessage {...messages.assignVariantDialogHeader} />
      </DialogTitle>
      <DialogContent className={scrollableDialogClasses.topArea}>
        <TextField
          name="query"
          value={query}
          onChange={onQueryChange}
          label={intl.formatMessage(messages.assignVariantDialogSearch)}
          placeholder={intl.formatMessage(messages.assignVariantDialogContent)}
          fullWidth
          InputProps={{
            autoComplete: "off",
            endAdornment: loading && <CircularProgress size={16} />
          }}
        />
      </DialogContent>
      <DialogContent
        className={scrollableDialogClasses.scrollArea}
        id={scrollableTargetId}
      >
        <InfiniteScroll
          dataLength={variants?.length}
          next={onFetchMore}
          hasMore={hasMore}
          scrollThreshold="100px"
          loader={
            <div className={scrollableDialogClasses.loadMoreLoaderContainer}>
              <CircularProgress size={16} />
            </div>
          }
          scrollableTarget={scrollableTargetId}
        >
          <ResponsiveTable key="table">
            <TableBody>
              {variants &&
                variants.map(variant => {
                  const isSelected = selectedVariants.some(
                    selectedVariant => selectedVariant === variant.id
                  );

                  return (
                    <TableRow
                      key={variant.id}
                      data-test-id="assign-variant-table-row"
                    >
                      <TableCellAvatar
                        className={classes.avatar}
                        thumbnail={maybe(() => variant.product.thumbnail.url)}
                      />
                      <TableCell className={classes.colName}>
                        {variant.product.name}
                      </TableCell>
                      <TableCell>{variant.name}</TableCell>
                      <TableCell
                        padding="checkbox"
                        className={classes.checkboxCell}
                      >
                        <Checkbox
                          checked={isSelected}
                          onChange={() =>
                            handleVariantAssign(
                              variant.id,
                              isSelected,
                              selectedVariants,
                              setSelectedVariants
                            )
                          }
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </ResponsiveTable>
        </InfiniteScroll>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          <FormattedMessage {...buttonMessages.back} />
        </Button>
        <ConfirmButton
          data-test="submit"
          transitionState={confirmButtonState}
          color="primary"
          variant="contained"
          type="submit"
          onClick={handleSubmit}
        >
          <FormattedMessage {...messages.assignVariantDialogButton} />
        </ConfirmButton>
      </DialogActions>
    </Dialog>
  );
};
AssignVariantDialog.displayName = "AssignVariantDialog";
export default AssignVariantDialog;
