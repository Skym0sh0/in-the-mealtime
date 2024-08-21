package de.sky.meal.ordering.mealordering.observers;

import generated.sky.meal.ordering.rest.model.Order;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Slf4j
@Service
public class OrderChangeAggregator implements OnOrderChange {

    private final List<OnOrderChange> delegates;

    public OrderChangeAggregator(List<OnOrderChange> delegates) {
        this.delegates = Objects.requireNonNull(delegates);
    }

    @Autowired
    public OrderChangeAggregator(OnOrderChange... delegates) {
        this(Arrays.asList(delegates));
    }

    @Override
    public void onNewOrder(Order order) {
        for (var d : delegates) {
            try {
                d.onNewOrder(order);
            } catch (Exception e) {
                log.error("Error occurred in onNewOrder in {}", d, e);
            }
        }
    }

    @Override
    public void onBeforeOrderDelete(UUID id) {
        for (var d : delegates) {
            try {
                d.onBeforeOrderDelete(id);
            } catch (Exception e) {
                log.error("Error occurred in onBeforeOrderDelete in {}", d, e);
            }
        }
    }

    @Override
    public void onLockOrder(Order order) {
        for (var d : delegates) {
            try {
                d.onLockOrder(order);
            } catch (Exception e) {
                log.error("Error occurred in onLockOrder in {}", d, e);
            }
        }
    }

    @Override
    public void onOrderIsReopened(Order order) {
        for (var d : delegates) {
            try {
                d.onOrderIsReopened(order);
            } catch (Exception e) {
                log.error("Error occurred in onOrderIsReopened in {}", d, e);
            }
        }
    }

    @Override
    public void onOrderIsOrdered(Order order) {
        for (var d : delegates) {
            try {
                d.onOrderIsOrdered(order);
            } catch (Exception e) {
                log.error("Error occurred in onOrderIsOrdered in {}", d, e);
            }
        }
    }

    @Override
    public void onOrderDelivered(Order order) {
        for (var d : delegates) {
            try {
                d.onOrderDelivered(order);
            } catch (Exception e) {
                log.error("Error occurred in onOrderDelivered in {}", d, e);
            }
        }
    }

    @Override
    public void onOrderIsRevoked(Order order) {
        for (var d : delegates) {
            try {
                d.onOrderIsRevoked(order);
            } catch (Exception e) {
                log.error("Error occurred in onOrderIsRevoked in {}", d, e);
            }
        }
    }

    @Override
    public void onBeforeOrderArchive(UUID id) {
        for (var d : delegates) {
            try {
                d.onBeforeOrderArchive(id);
            } catch (Exception e) {
                log.error("Error occurred in onBeforeOrderArchive in {}", d, e);
            }
        }
    }

    @Override
    public void onOrderPositionCreated(Order order) {
        for (var d : delegates) {
            try {
                d.onOrderPositionCreated(order);
            } catch (Exception e) {
                log.error("Error occurred in onOrderPositionCreated in {}", d, e);
            }
        }
    }

    @Override
    public void onOrderPositionUpdated(Order order) {
        for (var d : delegates) {
            try {
                d.onOrderPositionUpdated(order);
            } catch (Exception e) {
                log.error("Error occurred in onOrderPositionUpdated in {}", d, e);
            }
        }
    }

    @Override
    public void onOrderPositionDeleted(Order order) {
        for (var d : delegates) {
            try {
                d.onOrderPositionDeleted(order);
            } catch (Exception e) {
                log.error("Error occurred in onOrderPositionDeleted in {}", d, e);
            }
        }
    }

    @Override
    public void onOrderInfoUpdated(Order order) {
        for (var d : delegates) {
            try {
                d.onOrderInfoUpdated(order);
            } catch (Exception e) {
                log.error("Error occurred in onOrderInfoUpdated in {}", d, e);
            }
        }
    }
}
