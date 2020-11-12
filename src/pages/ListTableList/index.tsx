import { PlusOutlined } from '@ant-design/icons';
import { Button, Divider, message, Input, Drawer } from 'antd';
import React, { useState, useRef } from 'react';
import { useIntl, FormattedMessage } from 'umi';
import { PageContainer, FooterToolbar } from '@ant-design/pro-layout';
import ProTable, { ProColumns, ActionType } from '@ant-design/pro-table';
import ProDescriptions from '@ant-design/pro-descriptions';
import CreateForm from './components/CreateForm';
import UpdateForm, { FormValueType } from './components/UpdateForm';
import { TableListItem } from './data.d';
import { queryRule, updateRule, addRule, removeRule } from './service';

/**
 * 添加节点
 * @param fields
 */
const handleAdd = async (fields: TableListItem) => {
  const intl = useIntl();
  const hide = message.loading(
    intl.formatMessage({ id: 'pages.searchTable.handleAdd.loading', defaultMessage: '正在添加' }),
  );
  try {
    await addRule({ ...fields });
    hide();
    message.success(
      intl.formatMessage({ id: 'pages.searchTable.handleAdd.success', defaultMessage: '添加成功' }),
    );
    return true;
  } catch (error) {
    hide();
    message.error(
      intl.formatMessage({
        id: 'pages.searchTable.handleAdd.error',
        defaultMessage: '添加失败请重试！',
      }),
    );
    return false;
  }
};

/**
 * 更新节点
 * @param fields
 */
const handleUpdate = async (fields: FormValueType) => {
  const intl = useIntl();
  const hide = message.loading(
    intl.formatMessage({
      id: 'pages.searchTable.handleUpdate.loading',
      defaultMessage: '正在配置',
    }),
  );
  try {
    await updateRule({
      name: fields.name,
      desc: fields.desc,
      key: fields.key,
    });
    hide();

    message.success(
      intl.formatMessage({
        id: 'pages.searchTable.handleUpdate.success',
        defaultMessage: '配置成功',
      }),
    );
    return true;
  } catch (error) {
    hide();
    message.error(
      intl.formatMessage({
        id: 'pages.searchTable.handleUpdate.error',
        defaultMessage: '配置失败请重试！',
      }),
    );
    return false;
  }
};

/**
 *  删除节点
 * @param selectedRows
 */
const handleRemove = async (selectedRows: TableListItem[]) => {
  const intl = useIntl();
  const hide = message.loading(
    intl.formatMessage({
      id: 'pages.searchTable.handleRemove.loading',
      defaultMessage: '正在删除',
    }),
  );
  if (!selectedRows) return true;
  try {
    await removeRule({
      key: selectedRows.map((row) => row.key),
    });
    hide();
    message.success(
      intl.formatMessage({
        id: 'pages.searchTable.handleRemove.success',
        defaultMessage: '删除成功，即将刷新',
      }),
    );
    return true;
  } catch (error) {
    hide();
    message.error(
      intl.formatMessage({
        id: 'pages.searchTable.handleRemove.error',
        defaultMessage: '删除失败，请重试',
      }),
    );
    return false;
  }
};

const TableList: React.FC<{}> = () => {
  const [createModalVisible, handleModalVisible] = useState<boolean>(false);
  const [updateModalVisible, handleUpdateModalVisible] = useState<boolean>(false);
  const [stepFormValues, setStepFormValues] = useState({});
  const actionRef = useRef<ActionType>();
  const [row, setRow] = useState<TableListItem>();
  const [selectedRowsState, setSelectedRows] = useState<TableListItem[]>([]);
  const intl = useIntl();
  const columns: ProColumns<TableListItem>[] = [
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.tableListItem.nameTitle"
          defaultMessage="规则名称"
        />
      ),
      dataIndex: 'name',
      tip: '规则名称是唯一的 key',
      formItemProps: {
        rules: [
          {
            required: true,
            message: (
              <FormattedMessage
                id="pages.searchTable.tableListItem.nameRule"
                defaultMessage="规则名称为必填项"
              />
            ),
          },
        ],
      },
      render: (dom, entity) => {
        return <a onClick={() => setRow(entity)}>{dom}</a>;
      },
    },
    {
      title: (
        <FormattedMessage id="pages.searchTable.tableListItem.descTitle" defaultMessage="描述" />
      ),
      dataIndex: 'desc',
      valueType: 'textarea',
    },
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.tableListItem.callNoTitle"
          defaultMessage="服务调用次数"
        />
      ),
      dataIndex: 'callNo',
      sorter: true,
      hideInForm: true,
      renderText: (val: string) => `${val} 万`,
    },
    {
      title: (
        <FormattedMessage id="pages.searchTable.tableListItem.statusTitle" defaultMessage="状态" />
      ),
      dataIndex: 'status',
      hideInForm: true,
      valueEnum: {
        0: {
          text: (
            <FormattedMessage
              id="pages.searchTable.tableListItem.statusShutDown"
              defaultMessage="关闭"
            />
          ),
          status: 'Default',
        },
        1: {
          text: (
            <FormattedMessage
              id="pages.searchTable.tableListItem.statusRunning"
              defaultMessage="运行中"
            />
          ),
          status: 'Processing',
        },
        2: {
          text: (
            <FormattedMessage
              id="pages.searchTable.tableListItem.statusOnline"
              defaultMessage="已上线"
            />
          ),
          status: 'Success',
        },
        3: {
          text: (
            <FormattedMessage
              id="pages.searchTable.tableListItem.statusAbnormal"
              defaultMessage="异常"
            />
          ),
          status: 'Error',
        },
      },
    },
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.tableListItem.updatedAtTitle"
          defaultMessage="上次调度时间"
        />
      ),
      dataIndex: 'updatedAt',
      sorter: true,
      valueType: 'dateTime',
      hideInForm: true,
      renderFormItem: (item, { defaultRender, ...rest }, form) => {
        const status = form.getFieldValue('status');
        if (`${status}` === '0') {
          return false;
        }
        if (`${status}` === '3') {
          return (
            <Input
              {...rest}
              placeholder={intl.formatMessage({
                id: 'pages.searchTable.tableListItem.updatedAtStatus3',
                defaultMessage: '请输入异常原因！',
              })}
            />
          );
        }
        return defaultRender(item);
      },
    },
    {
      title: (
        <FormattedMessage id="pages.searchTable.tableListItem.optionTitle" defaultMessage="操作" />
      ),
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => (
        <>
          <a
            onClick={() => {
              handleUpdateModalVisible(true);
              setStepFormValues(record);
            }}
          >
            <FormattedMessage
              id="pages.searchTable.tableListItem.optionConfig"
              defaultMessage="配置"
            />
          </a>
          <Divider type="vertical" />
          <a href="">
            <FormattedMessage
              id="pages.searchTable.tableListItem.optionSubscribeAlerts"
              defaultMessage="订阅警报"
            />
          </a>
        </>
      ),
    },
  ];

  return (
    <PageContainer>
      <ProTable<TableListItem>
        headerTitle="查询表格"
        actionRef={actionRef}
        rowKey="key"
        search={{
          labelWidth: 120,
        }}
        toolBarRender={() => [
          <Button type="primary" onClick={() => handleModalVisible(true)}>
            <PlusOutlined /> 新建
          </Button>,
        ]}
        request={(params, sorter, filter) => queryRule({ ...params, sorter, filter })}
        columns={columns}
        rowSelection={{
          onChange: (_, selectedRows) => setSelectedRows(selectedRows),
        }}
      />
      {selectedRowsState?.length > 0 && (
        <FooterToolbar
          extra={
            <div>
              已选择 <a style={{ fontWeight: 600 }}>{selectedRowsState.length}</a> 项&nbsp;&nbsp;
              <span>
                服务调用次数总计 {selectedRowsState.reduce((pre, item) => pre + item.callNo, 0)} 万
              </span>
            </div>
          }
        >
          <Button
            onClick={async () => {
              await handleRemove(selectedRowsState);
              setSelectedRows([]);
              actionRef.current?.reloadAndRest?.();
            }}
          >
            批量删除
          </Button>
          <Button type="primary">批量审批</Button>
        </FooterToolbar>
      )}
      <CreateForm onCancel={() => handleModalVisible(false)} modalVisible={createModalVisible}>
        <ProTable<TableListItem, TableListItem>
          onSubmit={async (value) => {
            const success = await handleAdd(value);
            if (success) {
              handleModalVisible(false);
              if (actionRef.current) {
                actionRef.current.reload();
              }
            }
          }}
          rowKey="key"
          type="form"
          columns={columns}
        />
      </CreateForm>
      {stepFormValues && Object.keys(stepFormValues).length ? (
        <UpdateForm
          onSubmit={async (value) => {
            const success = await handleUpdate(value);
            if (success) {
              handleUpdateModalVisible(false);
              setStepFormValues({});
              if (actionRef.current) {
                actionRef.current.reload();
              }
            }
          }}
          onCancel={() => {
            handleUpdateModalVisible(false);
            setStepFormValues({});
          }}
          updateModalVisible={updateModalVisible}
          values={stepFormValues}
        />
      ) : null}

      <Drawer
        width={600}
        visible={!!row}
        onClose={() => {
          setRow(undefined);
        }}
        closable={false}
      >
        {row?.name && (
          <ProDescriptions<TableListItem>
            column={2}
            title={row?.name}
            request={async () => ({
              data: row || {},
            })}
            params={{
              id: row?.name,
            }}
            columns={columns}
          />
        )}
      </Drawer>
    </PageContainer>
  );
};

export default TableList;
